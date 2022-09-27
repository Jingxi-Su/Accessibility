// @ts-nocheck
import { calculateStageSize, customRequestIdleCallback, customCancelIdleCallback } from './utils/stage';

function accessKeyToAriaKey(key: string) {
  const name = key.slice(6).toLowerCase();
  if (name === 'role') return name;
  return `aria-${name}`;
}
interface AccessibleVirtualNode {
  virtualParent: AccessibleVirtualNode | null;
  parentAccessibleId: string;
  accessibleId: string;
  nodeType: NodeType;
  children: AccessibleVirtualNode[];
}

class AccessibleController {
  private static instance: AccessibleController;
  static ID_PREFIX = 'game-access';
  private runtime: RUNTIME = 'html5';
  private scaleX: number;
  private scaleY: number;
  private displayWidth: number;
  private displayHeight: number;
  // 无障碍化dom容器
  private accessibleDomRoot: HTMLDivElement;
  // 无障碍化开启开关按钮
  private accessibleSwitchBtn: HTMLButtonElement;
  // 引擎stage节点
  private engineNodeRoot: AccessibleEngineStageNode;
  // 需要生成无障碍化节点对应的引擎节点，key为accessibleId
  private engineNodeMap: Map<string, AccessibleEngineNode | AccessibleEngineContainer> = new Map();
  private oldVirtualTree: AccessibleVirtualNode;
  private virtualTree: AccessibleVirtualNode;
  private virtualTreeTimeout: any;
  private updateViewTimeout: any;
  private isDebugging: boolean = false;
  private isOpeningAccessibility: boolean = false;
  private isInited = false;
  private maskSettingForOtherBroEl: {
    maskSelfNodeId?: string,
    otherVisible: boolean;
  } = {
    otherVisible: true
  }

  private peddingChange: {
    type: 'delete' | 'add';
    accessibleId: string;
    nodeType: NodeType;
    node: AccessibleEngineNode | AccessibleEngineContainer;
  }[] = [];

  private constructor() {

  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new AccessibleController();
    }

    return this.instance;
  }

  // 初始化无障碍化功能
  init(options: {
    runtime: RUNTIME;
    h5EgretPlayerWrapperId: string;
    designWidth: number;
    designHeight: number;
    scaleMode: string;
    debugging: boolean;
    switchDesc: string;
  }) {
    const { runtime, designWidth, designHeight, scaleMode, h5EgretPlayerWrapperId, debugging, switchDesc } = options;
    this.isDebugging = debugging;
    this.runtime = runtime;

    if (runtime === 'html5') {
      const wrapper = document.getElementById(h5EgretPlayerWrapperId);
      if (wrapper) {
        const screenRect = wrapper.getBoundingClientRect();
        const { displayWidth, displayHeight, stageWidth, stageHeight } = calculateStageSize(scaleMode, screenRect.width, screenRect.height, designWidth, designHeight);
        const scalex = displayWidth / stageWidth;
        const scaley = displayHeight / stageHeight;
        this.scaleX = scalex;
        this.scaleY = scaley;
        this.displayWidth = displayWidth;
        this.displayHeight = displayHeight;
      }
      const style = document.createElement('style');
      style.textContent = `.accessible-base {position: absolute;border: 0;padding:0;z-index: 0;overflow: hidden;background:${debugging?'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0)'};color:rgba(0,0,0,0);}`;
      document.head.append(style);
      this.accessibleSwitchBtn = document.createElement('button');
      document.body.appendChild(this.accessibleSwitchBtn);
      this.accessibleSwitchBtn.style.width = '60px';
      this.accessibleSwitchBtn.style.height = '20px';
      this.accessibleSwitchBtn.className = 'accessible-base';
      this.accessibleSwitchBtn.setAttribute('aria-label', switchDesc || 'click to enabled accessibility');
      this.accessibleSwitchBtn.addEventListener('click', () => {
        this.isOpeningAccessibility = true;
        this.firstPaintInit(egret.MainContext.instance.stage as any);
        document.body.removeChild(this.accessibleSwitchBtn);
      });
    } else if (runtime === 'native') {
      const screenWidth = window.screen.availWidth;
      const screenHeight = window.screen.availHeight;
      const { displayWidth, displayHeight, stageWidth, stageHeight } = calculateStageSize(scaleMode, screenWidth, screenHeight, designWidth, designHeight);
      const scalex = displayWidth / stageWidth;
      const scaley = displayHeight / stageHeight;
      this.scaleX = scalex;
      this.scaleY = scaley;
      this.displayWidth = displayWidth;
      this.displayHeight = displayHeight;
      this.firstPaintInit(egret.MainContext.instance.stage as any);
    }
    
  }
  // 首屏加载可访问性节点，传入stage
  firstPaintInit(tree: AccessibleEngineStageNode) {
    this.engineNodeRoot = tree;
    this.virtualTree = {
      accessibleId: `${tree.hashCode}`,
      virtualParent: null,
      parentAccessibleId: '',
      children: [],
      nodeType: 'container',
      engineNode: tree,
    };
    this.engineNodeMap.set(`${tree.hashCode}`, tree);
    if (this.runtime === 'html5') {
      if (!this.accessibleDomRoot) {
        this.accessibleDomRoot = document.createElement('div');
        document.body.appendChild(this.accessibleDomRoot);
        this.accessibleDomRoot.style.width = `${this.displayWidth}px`;
        this.accessibleDomRoot.style.height = `${this.displayHeight}px`;
        this.accessibleDomRoot.style.position = 'absolute';
        this.accessibleDomRoot.style.top = '50%';
        this.accessibleDomRoot.style.left = '50%';
        this.accessibleDomRoot.style.zIndex = '999999';
        this.accessibleDomRoot.style.transform = `translate(-50%, -50%)`;
        this.accessibleDomRoot.style.pointerEvents = 'none';
      } else {
        this.accessibleDomRoot.style.display = 'block';
      }
    }
    this.isInited = true;
    this.updateAndCompareVirtualTree();
  }
  // 更新自身节点
  updateSelfAccessibleView(node: AccessibleEngineNode | AccessibleEngineContainer) {
    if (!node.isAccessibilityNode || !this.isInited) return;
    this.engineNodeUpdate(node);
  }
  // 自身节点首次进入
  firstPaintAccessibleView(node: AccessibleEngineNode | AccessibleEngineContainer) {
    if (!node.isAccessibilityNode) return;
    this.engineNodeBeAccessible(node);
  }

  // 删除引擎节点对应的无障碍化节点
  deleteAccessibleView(node: AccessibleEngineNode | AccessibleEngineContainer) {
    if (!this.isInited) return;
    this.addChange(node, 'delete');
  }

  private engineNodeBeAccessible(node: AccessibleEngineNode | AccessibleEngineContainer) {
    this.engineNodeMap.set(node.accessibleId, node);
    if (!this.isInited) return;
    this.addChange(node, 'add');
  }

  private engineNodeUpdate(node: AccessibleEngineNode | AccessibleEngineContainer) {
    this.engineNodeMap.set(node.accessibleId, node);
    if (this.runtime === 'html5') {
      const dom = document.getElementById(this.getAccessNodeId(node.accessibleId));
      if (dom) {
        this.updateDom(node, dom);
      }
    }else if (this.runtime === 'native') {
      this.updateNativeNode(node);
    }
  }
  private engineNodeBeUnaccessible(accessibleId: string) {
    this.engineNodeMap.delete(accessibleId);
  }

  private createNativeNode (node: AccessibleEngineNode | AccessibleEngineContainer){
    console.log('call createAccessibilityElementWithGroupID');
    nodePos = node.localToGlobal();
    const realX = nodePos.x * this.scaleX;
    const realY = nodePos.y * this.scaleY;
    const realWidth = node.width * this.scaleX;
    const realHeight = node.height * this.scaleY;
    window.bridgeCallHandlerPromise('createAccessibilityElementWithGroupID', {
      'groupID': node.groupID,
      'properties': {
        label: node.accessLabel,
        value: node.accessValue,
        traits: node.accessRole,
        frame: [realX.x, realY.y, realWidth, realHeight],
        enable: node.isAccessibilityNode,
        hashCode: node.accessibleId,
      },
    }, true);
  }

  private updateNativeNode (node: AccessibleEngineNode | AccessibleEngineContainer){
    console.log('call updateAccessibilityElements');
    nodePos = node.localToGlobal();
    window.bridgeCallHandlerPromise('updateAccessibilityElements', {
      'properties': {
        label: node.accessLabel,
        value: node.accessValue,
        traits: node.accessRole,
        frame: [nodePos.x, nodePos.y, node.width, node.height],
        enable: node.isAccessibilityNode,
        hashCode: node.accessibleId,
      },
    }, true);
  }

  private deleteNativeNode (node?: AccessibleEngineNode | AccessibleEngineContainer){
    console.log('call removeAccessibilityElementsWithGroupID');
    const gId = (node) ? node.groupID : '';
    const id = (node) ? node.accessibleId : '';
    window.bridgeCallHandlerPromise('removeAccessibilityElementsWithGroupID', {
      'groupID': gId,
      'properties': {
        hashCode: id,
      },
    }, true);
    this.engineNodeBeUnaccessible(node.accessibleId);
  }

  private addChange(node: AccessibleEngineNode | AccessibleEngineContainer, type: 'add' | 'delete') {
    const preChangeIndex = this.peddingChange.findIndex((changeItem) => {
      return changeItem.accessibleId === node.accessibleId;
    });
    if (preChangeIndex >= 0) {
      this.peddingChange.splice(preChangeIndex, 1);
    }
    this.peddingChange.push({
      type,
      accessibleId: node.accessibleId,
      nodeType: node.type,
      node,
    });
    this.peddingChange.sort((item1, item2) => {
      return Number(item1.accessibleId) - Number(item2.accessibleId);
    });

    this.updateTreeByChange();
  }

  private updateTreeByChange() {
    if (this.virtualTreeTimeout) {
      clearTimeout(this.virtualTreeTimeout);
    }
    this.virtualTreeTimeout = setTimeout(() => {
      if (this.peddingChange.length > 5) {
        return this.updateAndCompareVirtualTree();
      }

      this.oldVirtualTree = this.virtualTree;

      // 将变动的节点的祖先节点都变成新节点，和旧树区分
      const run = function(parentNode: AccessibleVirtualNode | null, newChildNode: AccessibleVirtualNode) {
        if (!parentNode) return newChildNode;

        const newParentNode = Object.assign({}, parentNode);
        newParentNode.children = [...parentNode.children];
        const index = newParentNode.children.findIndex((child) => {
          return child.accessibleId === newChildNode.accessibleId;
        });
        if (index >= 0) {
          newParentNode.children.splice(index, 1, newChildNode);
        }

        return run(newParentNode.virtualParent, newParentNode);
      };

      const changeList: {
        type: 'delete' | 'add';
        virtualParentAccessibleId: string;
        accessibleId: string;
        nodeType: NodeType;
        index?: number;
      }[] = [];
      for (let i = 0; i < this.peddingChange.length; i++) {
        let preBroDomCount = 0;

        const changeItem = this.peddingChange[i];
        const parentVNode = this.getAccessibleVirtualParent(changeItem.node);

        const newParentVNode = Object.assign({}, parentVNode);
  
        this.virtualTree = run(parentVNode.virtualParent, newParentVNode);

        // 更新该节点对应的虚拟节点
        if (changeItem.type === 'delete') {
          const index = newParentVNode.children.findIndex((child) => {
            return child.accessibleId === changeItem.node.accessibleId;
          });
          if (index >= 0) {
            newParentVNode.children.splice(index, 1);
          }
        } else {
          const vNode = {
            parentAccessibleId: changeItem.node.$parent.accessibleId,
            virtualParent: newParentVNode,
            accessibleId: changeItem.node.accessibleId,
            nodeType: changeItem.node.type,
            children: [],
            engineNode: changeItem.node,
          };
          changeItem.node.$$accessibleVirtualNode = vNode;
          if (newParentVNode.children.length === 0) {
            newParentVNode.children.push(vNode);
          } else {
            const engineNode = newParentVNode.engineNode;
            // 查找节点应该在什么位置
            const run = (engineNode) => {
              if (!engineNode.$children) return false;
              for (let i = 0; i < engineNode.$children.length; i++) {
                const child = engineNode.$children[i];

                if (child.accessibleId === changeItem.node.accessibleId) {
                  return true;
                }
                if (child.isAccessibilityNode) {
                  preBroDomCount++;
                } else {
                  const a = run(child);
                  if (a) {
                    return true;
                  }
                }
              }
            };
            run(engineNode);
            newParentVNode.children.splice(preBroDomCount, 0, vNode);
          }
        }
        changeList.push({
          type: changeItem.type,
          virtualParentAccessibleId: parentVNode.accessibleId,
          accessibleId: changeItem.accessibleId,
          nodeType: changeItem.nodeType,
          index: preBroDomCount
        });
      }

      if (this.updateViewTimeout) {
        customCancelIdleCallback(this.updateViewTimeout);
      }
      this.updateViewTimeout = customRequestIdleCallback(() => {
        this.updateAccessibleAllView(changeList);
        // 完成更新后再删除map中的node
        for (i = 0; i < this.peddingChange.length; i++) {
          if (this.peddingChange[i].type === 'delete') {
            this.engineNodeMap.delete(this.peddingChange[i].accessibleId);
          }
        }
        this.peddingChange = [];
      });
    }, 0);
  }

  private updateAndCompareVirtualTree() {
    if (this.virtualTreeTimeout) {
      clearTimeout(this.virtualTreeTimeout);
    }
    this.virtualTreeTimeout = setTimeout(() => {
      this.updateVirtualTree();
      const changeList = this.compareVirtualTree();

      if (this.updateViewTimeout) {
        customCancelIdleCallback(this.updateViewTimeout);
      }
      this.updateViewTimeout = customRequestIdleCallback(() => {
        this.updateAccessibleAllView(changeList);
      });
    }, 0);
  }

  private updateAccessibleAllView(changeList) {
    if (this.runtime === 'html5') {
      if (changeList.length > 5) {
        this.createAccessibleDom();
      } else {
        this.changeAccessibleDom(changeList);
      }
    } else if (this.runtime === 'native') {
        this.changeAccessibleNative(changeList);
    }
  }

  private createAccessibleNative() {
    window.bridgeCallHandlerPromise('removeAccessibilityElements', '', true);
    const run = (root: AccessibleVirtualNode) => {
      const changeNode = this.engineNodeMap.get(root.accessibleId);
      this.createNativeNode(changeNode)
      root.children.forEach((child) => {
        run(child);
      });
    };

    run(this.virtualTree);
  }

  private changeAccessibleNative(changeList: {
    type: "delete" | "add";
    virtualParentAccessibleId: string;
    accessibleId: string;
    nodeType: NodeType;
    index?: number | undefined;
}[]) {
    changeList.forEach((change) => {
      const changeNode = this.engineNodeMap.get(change.accessibleId);
      if (change.type === 'delete') {
        this.deleteNativeNode(changeNode);
      } else {
          if (changeNode) {
            this.createNativeNode(changeNode);
          }
      }
    });
  }

  private changeAccessibleDom(changeList: {
    type: "delete" | "add";
    virtualParentAccessibleId: string;
    accessibleId: string;
    nodeType: NodeType;
    index?: number | undefined;
}[]) {
    if (this.accessibleDomRoot.children.length === 0) {
      const root = document.createElement('div');
      root.id = this.getAccessNodeId(this.engineNodeRoot.hashCode);
      this.accessibleDomRoot.appendChild(root);
      this.updateDom(this.engineNodeRoot, root, true);
    }
    changeList.forEach((change) => {
      const id = this.getAccessNodeId(change.accessibleId);

      if (change.type === 'delete') {
        const dom = document.getElementById(id);
        if (dom) {
          dom.remove();
        }
      } else {
        const parentId = this.getAccessNodeId(change.virtualParentAccessibleId);
        const parentDom = document.getElementById(parentId);
        if (parentDom) {
          const domType = {
            container: 'div',
            label: 'div',
            button: 'button',
            ul: 'ul',
            li: 'li',
            group: 'div',
          };

          const dom = document.createElement(domType[change.nodeType]);
          dom.id = this.getAccessNodeId(change.accessibleId);
          const broDom = parentDom.children[change.index || parentDom.children.length];

          parentDom.insertBefore(dom, broDom);
          const changeNode = this.engineNodeMap.get(change.accessibleId);
          if (changeNode) {
            this.updateDom(changeNode, dom);
          }
        }
      }
    });
  }

  private createAccessibleDom() {
    const doc = document.createDocumentFragment();
    const domType = {
      container: 'div',
      label: 'div',
      button: 'button',
      ul: 'ul',
      li: 'li',
    };
    const run = (root: AccessibleVirtualNode, domRoot) => {
      const dom = document.createElement(domType[root.nodeType]);
      dom.id = this.getAccessNodeId(root.accessibleId);
      domRoot.appendChild(dom);
      const state = this.engineNodeMap.get(root.accessibleId);
      this.updateDom(state as AccessibleEngineNode, dom);

      root.children.forEach((child) => {
        run(child, dom);
      });
    };

    run(this.virtualTree, doc);

    this.accessibleDomRoot.innerHTML = '';
    this.accessibleDomRoot.appendChild(doc);
  }

  private updateVirtualTree() {
    this.oldVirtualTree = this.virtualTree;
    this.virtualTree = {
      accessibleId: `${this.engineNodeRoot.hashCode}`,
      virtualParent: null,
      parentAccessibleId: '',
      children: [],
      nodeType: 'container',
      engineNode: this.engineNodeRoot
    };
    this.deepUpdateVirtualTree(this.engineNodeRoot);
  }

  private deepUpdateVirtualTree(root: AccessibleEngineContainer | AccessibleEngineNode) {
    if (!this.isWrapperNode(root)) {
      return;
    }
    root.$children.forEach((child) => {
      if (child.isAccessibilityNode) {
        const parent = this.getAccessibleVirtualParent(child);
        const vNode = {
          parentAccessibleId: child.parent.accessibleId,
          virtualParent: parent,
          accessibleId: child.accessibleId,
          nodeType: child.type,
          children: [],
          engineNode: child,
        };
        child.$$accessibleVirtualNode = vNode;

        parent.children.push(vNode);
      }
      if (child.checkChildrenAccessible !== false) {
        this.deepUpdateVirtualTree(child);
      }
    });
  }

  private compareVirtualTree() {
    const list: {
      type: 'delete' | 'add';
      virtualParentAccessibleId: string;
      accessibleId: string;
      nodeType: NodeType;
      index?: number;
    }[] = [];
    const deepCompare = (oldTree: AccessibleVirtualNode | undefined, newTree: AccessibleVirtualNode | undefined) => {
      if (!oldTree && !newTree) {
        return;
      }
      if (!oldTree && newTree) {
        list.push({
          type: 'add',
          accessibleId: newTree.accessibleId,
          virtualParentAccessibleId: newTree.virtualParent ? newTree.virtualParent.accessibleId : '',
          nodeType: newTree.nodeType,
        });
        newTree.children.forEach((child) => {
          deepCompare(undefined, child);
        });
      } else if (!newTree && oldTree) {
        list.push({
          type: 'delete',
          accessibleId: oldTree.accessibleId,
          virtualParentAccessibleId: oldTree.virtualParent ? oldTree.virtualParent.accessibleId : '',
          nodeType: oldTree.nodeType,
        });
        oldTree.children.forEach((child) => {
          deepCompare(child, undefined);
        });
      } else if (oldTree && newTree && oldTree.accessibleId !== newTree.accessibleId) {
        list.push({
          type: 'delete',
          accessibleId: oldTree.accessibleId,
          virtualParentAccessibleId: oldTree.virtualParent ? oldTree.virtualParent.accessibleId : '',
          nodeType: oldTree.nodeType,
        });
        list.push({
          type: 'add',
          accessibleId: newTree.accessibleId,
          virtualParentAccessibleId: newTree.virtualParent ? newTree.virtualParent.accessibleId : '',
          nodeType: newTree.nodeType,
          index: newTree.virtualParent ? newTree.virtualParent.children.findIndex((child) => child.accessibleId === newTree.accessibleId) : 0,
        });
        oldTree.children.forEach((child) => {
          deepCompare(child, undefined);
        });
        newTree.children.forEach((child) => {
          deepCompare(undefined, child);
        });
      } else if (oldTree && newTree && oldTree.accessibleId === newTree.accessibleId) {
        const length = Math.max(oldTree.children.length, newTree.children.length);
        for (let i = 0; i < length; i++) {
          deepCompare(oldTree.children[i], newTree.children[i]);
        }
      }
    };
    deepCompare(this.oldVirtualTree, this.virtualTree);

    return list;
  }

  clearAccessibleView(container?: AccessibleEngineNode | AccessibleEngineContainer) {
    if (this.runtime === 'html5') {
      if (container) {
        const id = this.getAccessNodeId(container.accessibleId);
        const dom = document.getElementById(id);
        if (dom) {
          dom.innerHTML = '';
        }
        return;
      }
      this.accessibleDomRoot.innerHTML = '';
      this.accessibleDomRoot.style.display = 'none';
    } else if(this.runtime === 'native'){
      this.deleteNativeNode(container);
    }
  }

  // TODO:
  private updateDom(node: AccessibleEngineNode | AccessibleEngineContainer, dom: HTMLElement, isRoot = false) {
    const accessDataKeys = ['accessRole', 'accessLabel', 'accessValue', 'accessChecked', 'accessHidden', 'accessDisabled'];

    const parentDom = dom.parentElement;
    const egretPos = node.localToGlobal();
    let parentLeft = 0;
    let parentTop = 0;
    if (parentDom && !isRoot) {
      parentLeft = parseFloat(parentDom.attributes.getNamedItem('realLeft')?.nodeValue || parentDom.style.left);
      parentTop = parseFloat(parentDom.attributes.getNamedItem('realTop')?.nodeValue || parentDom.style.top);
    }
    const realLeft = egretPos.x * this.scaleX; // 相对于root的偏移量
    const realTop = egretPos.y * this.scaleY; // 相对于root的偏移量
    dom.setAttribute('realLeft', `${realLeft}`);
    dom.setAttribute('realTop', `${realTop}`);
    const left = realLeft - parentLeft;
    const top = realTop - parentTop;
    const { text, textWidth, textHeight, width: nWidth, height: nHeight } = (node as any);
    const width = (text ? textWidth : nWidth) * this.scaleX;
    const height = (text ? textHeight : nHeight) * this.scaleY;
    dom.style.top = `${top}px`;
    dom.style.left = `${left}px`;
    dom.style.width = `${width}px`;
    dom.style.height = `${height}px`;
    dom.style.display = node.visible === false ? 'none' : 'block';
    if (node.accessibleId === this.maskSettingForOtherBroEl.maskSelfNodeId) {
      dom.parentNode?.childNodes.forEach((d) => {
        if (d.id === this.getAccessNodeId(this.maskSettingForOtherBroEl.maskSelfNodeId)) return;
        d.style.display = this.maskSettingForOtherBroEl.otherVisible ? 'block' : 'none';
      });
    }
    dom.classList.add('accessible-base');
    if (node.type === 'label') {
      dom.innerText = (node as AccessibleEngineLabelNode).text;
    }
    if (node.type === 'container') {
      dom.style.overflow = 'initial';
    }
    if (dom.tagName === 'UL' || node['accessRole'] === 'list' ) {
      dom.style.overflow = 'scroll';
      dom.addEventListener('scroll', (ev) => {
        (node as any).$parent.viewport.scrollV = (ev.target as HTMLElement).scrollTop / this.scaleY;
        (node as any).$parent.viewport.scrollH = (ev.target as HTMLElement).scrollLeft / this.scaleX;
      });
    }
    accessDataKeys.forEach((key) => {
      if (node[key] !== undefined && node[key] !== '') {
        dom.setAttribute(accessKeyToAriaKey(key), node[key]);
      }
    });
  }
  private getAccessNodeId(accessibleId: number | string) {
    if (typeof accessibleId === 'string' && accessibleId.startsWith(AccessibleController.ID_PREFIX)) {
      return accessibleId;
    }
    return `${AccessibleController.ID_PREFIX}-${accessibleId}`;
  }

  private isWrapperNode(node: AccessibleEngineNode | AccessibleEngineContainer): node is AccessibleEngineContainer {
    return !!(<AccessibleEngineContainer>node).$children;
  }

  private getAccessibleVirtualParent(node: AccessibleEngineNode | AccessibleEngineContainer) {
    let n = node;
    const root = this.engineNodeRoot;
    while (n && n !== root) {
      const p = n.parent;
      if (!p) {
        return this.virtualTree;
      }
      const node = this.searchVirtualNode(p.accessibleId);
      if (node) {
        return node;
      }
      n = p as AccessibleEngineContainer;
    }

    return this.virtualTree;
  }
  private searchVirtualNode(accessibleId: string) {
    const run = (node: AccessibleVirtualNode, accessibleId: string): AccessibleVirtualNode | null => {
      if (accessibleId === node.accessibleId) {
        return node;
      }
      for (let i = 0; i < node.children.length; i++) {
        const res = run(node.children[i], accessibleId);;
        if (res) {
          return res;
        }
      }
      return null;
    }

    return run(this.virtualTree, accessibleId);
  }

  updateOtherBroVisible(visible: boolean, selfNode: any) {
    this.maskSettingForOtherBroEl = {
      maskSelfNodeId: selfNode.accessibleId,
      otherVisible: visible
    };
  }
}

export default AccessibleController;
