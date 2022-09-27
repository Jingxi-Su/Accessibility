import { SmartEvent } from '@game-egret-common/game-util';

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

var SCALE_MODE = {
  FIXED_WIDE: 'fixedWide',
  FIXED_NARROW: 'fixedNarrow',
  FIXED_HEIGHT: 'fixedHeight',
  FIXED_WIDTH: 'fixedWidth',
  EXACT_FIT: 'exactFit',
  NO_BORDER: 'noBorder',
  SHOW_ALL: 'showAll',
  NO_SCALE: 'noScale'
};

/**
 * @private
 * 计算舞台显示尺寸
 * @param scaleMode 当前的缩放模式
 * @param screenWidth 播放器视口宽度
 * @param screenHeight 播放器视口高度
 * @param contentWidth 初始化内容宽度
 * @param contentHeight 初始化内容高度
 */

function calculateStageSize(scaleMode, screenWidth, screenHeight, contentWidth, contentHeight) {
  var displayWidth = screenWidth;
  var displayHeight = screenHeight;
  var stageWidth = contentWidth;
  var stageHeight = contentHeight;
  var scaleX = screenWidth / stageWidth || 0;
  var scaleY = screenHeight / stageHeight || 0;

  switch (scaleMode) {
    case SCALE_MODE.EXACT_FIT:
      break;

    case SCALE_MODE.FIXED_HEIGHT:
      stageWidth = Math.round(screenWidth / scaleY);
      break;

    case SCALE_MODE.FIXED_WIDTH:
      stageHeight = Math.round(screenHeight / scaleX);
      break;

    case SCALE_MODE.NO_BORDER:
      if (scaleX > scaleY) {
        displayHeight = Math.round(stageHeight * scaleX);
      } else {
        displayWidth = Math.round(stageWidth * scaleY);
      }

      break;

    case SCALE_MODE.SHOW_ALL:
      if (scaleX > scaleY) {
        displayWidth = Math.round(stageWidth * scaleY);
      } else {
        displayHeight = Math.round(stageHeight * scaleX);
      }

      break;

    case SCALE_MODE.FIXED_NARROW:
      if (scaleX > scaleY) {
        stageWidth = Math.round(screenWidth / scaleY);
      } else {
        stageHeight = Math.round(screenHeight / scaleX);
      }

      break;

    case SCALE_MODE.FIXED_WIDE:
      if (scaleX > scaleY) {
        stageHeight = Math.round(screenHeight / scaleX);
      } else {
        stageWidth = Math.round(screenWidth / scaleY);
      }

      break;

    default:
      stageWidth = screenWidth;
      stageHeight = screenHeight;
      break;
  }

  if (egret.Capabilities.runtimeType != egret.RuntimeType.WXGAME) {
    //宽高不是2的整数倍会导致图片绘制出现问题
    if (stageWidth % 2 != 0) {
      stageWidth += 1;
    }

    if (stageHeight % 2 != 0) {
      stageHeight += 1;
    }

    if (displayWidth % 2 != 0) {
      displayWidth += 1;
    }

    if (displayHeight % 2 != 0) {
      displayHeight += 1;
    }
  }

  return {
    stageWidth: stageWidth,
    stageHeight: stageHeight,
    displayWidth: displayWidth,
    displayHeight: displayHeight
  };
}
function enumerable(val) {
  return function (target, properKey, descriptor) {
    descriptor.enumerable = val;
  };
}
function customRequestIdleCallback(callback, options) {
  // @ts-ignore
  if (window.requestIdleCallback) {
    // @ts-ignore
    return window.requestIdleCallback(callback, options);
  }

  return setTimeout(function () {
    callback({
      didTimeout: true,
      timeRemaining: function timeRemaining() {
        return 60;
      }
    });
  }, options && options.timeout ? options.timeout : 0);
}
function customCancelIdleCallback(timeout) {
  // @ts-ignore
  if (window.requestIdleCallback) {
    // @ts-ignore
    return window.cancelIdleCallback(timeout);
  }

  return clearTimeout(timeout);
}

function accessKeyToAriaKey(key) {
  var name = key.slice(6).toLowerCase();
  if (name === 'role') return name;
  return "aria-".concat(name);
}

var AccessibleController = /*#__PURE__*/function () {
  function AccessibleController() {
    _classCallCheck(this, AccessibleController);

    this.runtime = 'html5'; // 需要生成无障碍化节点对应的引擎节点，key为accessibleId

    this.engineNodeMap = new Map();
    this.isDebugging = false;
    this.isOpeningAccessibility = false;
    this.isInited = false;
    this.maskSettingForOtherBroEl = {
      otherVisible: true
    };
    this.peddingChange = [];
  }

  _createClass(AccessibleController, [{
    key: "init",
    value: // 初始化无障碍化功能
    function init(options) {
      var _this = this;

      var runtime = options.runtime,
          designWidth = options.designWidth,
          designHeight = options.designHeight,
          scaleMode = options.scaleMode,
          h5EgretPlayerWrapperId = options.h5EgretPlayerWrapperId,
          debugging = options.debugging,
          switchDesc = options.switchDesc;
      this.isDebugging = debugging;
      this.runtime = runtime;

      if (runtime === 'html5') {
        var wrapper = document.getElementById(h5EgretPlayerWrapperId);

        if (wrapper) {
          var screenRect = wrapper.getBoundingClientRect();

          var _calculateStageSize = calculateStageSize(scaleMode, screenRect.width, screenRect.height, designWidth, designHeight),
              displayWidth = _calculateStageSize.displayWidth,
              displayHeight = _calculateStageSize.displayHeight,
              stageWidth = _calculateStageSize.stageWidth,
              stageHeight = _calculateStageSize.stageHeight;

          var scalex = displayWidth / stageWidth;
          var scaley = displayHeight / stageHeight;
          this.scaleX = scalex;
          this.scaleY = scaley;
          this.displayWidth = displayWidth;
          this.displayHeight = displayHeight;
        }

        var style = document.createElement('style');
        style.textContent = ".accessible-base {position: absolute;border: 0;padding:0;z-index: 0;overflow: hidden;background:".concat(debugging ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0)', ";color:rgba(0,0,0,0);}");
        document.head.append(style);
        this.accessibleSwitchBtn = document.createElement('button');
        document.body.appendChild(this.accessibleSwitchBtn);
        this.accessibleSwitchBtn.style.width = '60px';
        this.accessibleSwitchBtn.style.height = '20px';
        this.accessibleSwitchBtn.className = 'accessible-base';
        this.accessibleSwitchBtn.setAttribute('aria-label', switchDesc || 'click to enabled accessibility');
        this.accessibleSwitchBtn.addEventListener('click', function () {
          _this.isOpeningAccessibility = true;

          _this.firstPaintInit(egret.MainContext.instance.stage);

          document.body.removeChild(_this.accessibleSwitchBtn);
        });
      } else if (runtime === 'native') {
        var screenWidth = window.screen.availWidth;
        var screenHeight = window.screen.availHeight;

        var _calculateStageSize2 = calculateStageSize(scaleMode, screenWidth, screenHeight, designWidth, designHeight),
            _displayWidth = _calculateStageSize2.displayWidth,
            _displayHeight = _calculateStageSize2.displayHeight,
            _stageWidth = _calculateStageSize2.stageWidth,
            _stageHeight = _calculateStageSize2.stageHeight;

        var _scalex = _displayWidth / _stageWidth;

        var _scaley = _displayHeight / _stageHeight;

        this.scaleX = _scalex;
        this.scaleY = _scaley;
        this.displayWidth = _displayWidth;
        this.displayHeight = _displayHeight;
        this.firstPaintInit(egret.MainContext.instance.stage);
      }
    } // 首屏加载可访问性节点，传入stage

  }, {
    key: "firstPaintInit",
    value: function firstPaintInit(tree) {
      this.engineNodeRoot = tree;
      this.virtualTree = {
        accessibleId: "".concat(tree.hashCode),
        virtualParent: null,
        parentAccessibleId: '',
        children: [],
        nodeType: 'container',
        engineNode: tree
      };
      this.engineNodeMap.set("".concat(tree.hashCode), tree);

      if (this.runtime === 'html5') {
        if (!this.accessibleDomRoot) {
          this.accessibleDomRoot = document.createElement('div');
          document.body.appendChild(this.accessibleDomRoot);
          this.accessibleDomRoot.style.width = "".concat(this.displayWidth, "px");
          this.accessibleDomRoot.style.height = "".concat(this.displayHeight, "px");
          this.accessibleDomRoot.style.position = 'absolute';
          this.accessibleDomRoot.style.top = '50%';
          this.accessibleDomRoot.style.left = '50%';
          this.accessibleDomRoot.style.zIndex = '999999';
          this.accessibleDomRoot.style.transform = "translate(-50%, -50%)";
          this.accessibleDomRoot.style.pointerEvents = 'none';
        } else {
          this.accessibleDomRoot.style.display = 'block';
        }
      }

      this.isInited = true;
      this.updateAndCompareVirtualTree();
    } // 更新自身节点

  }, {
    key: "updateSelfAccessibleView",
    value: function updateSelfAccessibleView(node) {
      if (!node.isAccessibilityNode || !this.isInited) return;
      this.engineNodeUpdate(node);
    } // 自身节点首次进入

  }, {
    key: "firstPaintAccessibleView",
    value: function firstPaintAccessibleView(node) {
      if (!node.isAccessibilityNode) return;
      this.engineNodeBeAccessible(node);
    } // 删除引擎节点对应的无障碍化节点

  }, {
    key: "deleteAccessibleView",
    value: function deleteAccessibleView(node) {
      if (!this.isInited) return;
      this.addChange(node, 'delete');
    }
  }, {
    key: "engineNodeBeAccessible",
    value: function engineNodeBeAccessible(node) {
      this.engineNodeMap.set(node.accessibleId, node);
      if (!this.isInited) return;
      this.addChange(node, 'add');
    }
  }, {
    key: "engineNodeUpdate",
    value: function engineNodeUpdate(node) {
      this.engineNodeMap.set(node.accessibleId, node);

      if (this.runtime === 'html5') {
        var dom = document.getElementById(this.getAccessNodeId(node.accessibleId));

        if (dom) {
          this.updateDom(node, dom);
        }
      } else if (this.runtime === 'native') {
        this.updateNativeNode(node);
      }
    }
  }, {
    key: "engineNodeBeUnaccessible",
    value: function engineNodeBeUnaccessible(accessibleId) {
      this.engineNodeMap["delete"](accessibleId);
    }
  }, {
    key: "createNativeNode",
    value: function createNativeNode(node) {
      console.log('call createAccessibilityElementWithGroupID');
      nodePos = node.localToGlobal();
      var realX = nodePos.x * this.scaleX;
      var realY = nodePos.y * this.scaleY;
      var realWidth = node.width * this.scaleX;
      var realHeight = node.height * this.scaleY;
      window.bridgeCallHandlerPromise('createAccessibilityElementWithGroupID', {
        'groupID': node.groupID,
        'properties': {
          label: node.accessLabel,
          value: node.accessValue,
          traits: node.accessRole,
          frame: [realX.x, realY.y, realWidth, realHeight],
          enable: node.isAccessibilityNode,
          hashCode: node.accessibleId
        }
      }, true);
    }
  }, {
    key: "updateNativeNode",
    value: function updateNativeNode(node) {
      console.log('call updateAccessibilityElements');
      nodePos = node.localToGlobal();
      window.bridgeCallHandlerPromise('updateAccessibilityElements', {
        'properties': {
          label: node.accessLabel,
          value: node.accessValue,
          traits: node.accessRole,
          frame: [nodePos.x, nodePos.y, node.width, node.height],
          enable: node.isAccessibilityNode,
          hashCode: node.accessibleId
        }
      }, true);
    }
  }, {
    key: "deleteNativeNode",
    value: function deleteNativeNode(node) {
      console.log('call removeAccessibilityElementsWithGroupID');
      var gId = node ? node.groupID : '';
      var id = node ? node.accessibleId : '';
      window.bridgeCallHandlerPromise('removeAccessibilityElementsWithGroupID', {
        'groupID': gId,
        'properties': {
          hashCode: id
        }
      }, true);
      this.engineNodeBeUnaccessible(node.accessibleId);
    }
  }, {
    key: "addChange",
    value: function addChange(node, type) {
      var preChangeIndex = this.peddingChange.findIndex(function (changeItem) {
        return changeItem.accessibleId === node.accessibleId;
      });

      if (preChangeIndex >= 0) {
        this.peddingChange.splice(preChangeIndex, 1);
      }

      this.peddingChange.push({
        type: type,
        accessibleId: node.accessibleId,
        nodeType: node.type,
        node: node
      });
      this.peddingChange.sort(function (item1, item2) {
        return Number(item1.accessibleId) - Number(item2.accessibleId);
      });
      this.updateTreeByChange();
    }
  }, {
    key: "updateTreeByChange",
    value: function updateTreeByChange() {
      var _this2 = this;

      if (this.virtualTreeTimeout) {
        clearTimeout(this.virtualTreeTimeout);
      }

      this.virtualTreeTimeout = setTimeout(function () {
        if (_this2.peddingChange.length > 5) {
          return _this2.updateAndCompareVirtualTree();
        }

        _this2.oldVirtualTree = _this2.virtualTree; // 将变动的节点的祖先节点都变成新节点，和旧树区分

        var run = function run(parentNode, newChildNode) {
          if (!parentNode) return newChildNode;
          var newParentNode = Object.assign({}, parentNode);
          newParentNode.children = _toConsumableArray(parentNode.children);
          var index = newParentNode.children.findIndex(function (child) {
            return child.accessibleId === newChildNode.accessibleId;
          });

          if (index >= 0) {
            newParentNode.children.splice(index, 1, newChildNode);
          }

          return run(newParentNode.virtualParent, newParentNode);
        };

        var changeList = [];

        var _loop = function _loop(_i) {
          var preBroDomCount = 0;
          var changeItem = _this2.peddingChange[_i];

          var parentVNode = _this2.getAccessibleVirtualParent(changeItem.node);

          var newParentVNode = Object.assign({}, parentVNode);
          _this2.virtualTree = run(parentVNode.virtualParent, newParentVNode); // 更新该节点对应的虚拟节点

          if (changeItem.type === 'delete') {
            var index = newParentVNode.children.findIndex(function (child) {
              return child.accessibleId === changeItem.node.accessibleId;
            });

            if (index >= 0) {
              newParentVNode.children.splice(index, 1);
            }
          } else {
            var vNode = {
              parentAccessibleId: changeItem.node.$parent.accessibleId,
              virtualParent: newParentVNode,
              accessibleId: changeItem.node.accessibleId,
              nodeType: changeItem.node.type,
              children: [],
              engineNode: changeItem.node
            };
            changeItem.node.$$accessibleVirtualNode = vNode;

            if (newParentVNode.children.length === 0) {
              newParentVNode.children.push(vNode);
            } else {
              var engineNode = newParentVNode.engineNode; // 查找节点应该在什么位置

              var _run = function _run(engineNode) {
                if (!engineNode.$children) return false;

                for (var _i2 = 0; _i2 < engineNode.$children.length; _i2++) {
                  var child = engineNode.$children[_i2];

                  if (child.accessibleId === changeItem.node.accessibleId) {
                    return true;
                  }

                  if (child.isAccessibilityNode) {
                    preBroDomCount++;
                  } else {
                    var a = _run(child);

                    if (a) {
                      return true;
                    }
                  }
                }
              };

              _run(engineNode);

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
        };

        for (var _i = 0; _i < _this2.peddingChange.length; _i++) {
          _loop(_i);
        }

        if (_this2.updateViewTimeout) {
          customCancelIdleCallback(_this2.updateViewTimeout);
        }

        _this2.updateViewTimeout = customRequestIdleCallback(function () {
          _this2.updateAccessibleAllView(changeList); // 完成更新后再删除map中的node


          for (i = 0; i < _this2.peddingChange.length; i++) {
            if (_this2.peddingChange[i].type === 'delete') {
              _this2.engineNodeMap["delete"](_this2.peddingChange[i].accessibleId);
            }
          }

          _this2.peddingChange = [];
        });
      }, 0);
    }
  }, {
    key: "updateAndCompareVirtualTree",
    value: function updateAndCompareVirtualTree() {
      var _this3 = this;

      if (this.virtualTreeTimeout) {
        clearTimeout(this.virtualTreeTimeout);
      }

      this.virtualTreeTimeout = setTimeout(function () {
        _this3.updateVirtualTree();

        var changeList = _this3.compareVirtualTree();

        if (_this3.updateViewTimeout) {
          customCancelIdleCallback(_this3.updateViewTimeout);
        }

        _this3.updateViewTimeout = customRequestIdleCallback(function () {
          _this3.updateAccessibleAllView(changeList);
        });
      }, 0);
    }
  }, {
    key: "updateAccessibleAllView",
    value: function updateAccessibleAllView(changeList) {
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
  }, {
    key: "createAccessibleNative",
    value: function createAccessibleNative() {
      var _this4 = this;

      window.bridgeCallHandlerPromise('removeAccessibilityElements', '', true);

      var run = function run(root) {
        var changeNode = _this4.engineNodeMap.get(root.accessibleId);

        _this4.createNativeNode(changeNode);

        root.children.forEach(function (child) {
          run(child);
        });
      };

      run(this.virtualTree);
    }
  }, {
    key: "changeAccessibleNative",
    value: function changeAccessibleNative(changeList) {
      var _this5 = this;

      changeList.forEach(function (change) {
        var changeNode = _this5.engineNodeMap.get(change.accessibleId);

        if (change.type === 'delete') {
          _this5.deleteNativeNode(changeNode);
        } else {
          if (changeNode) {
            _this5.createNativeNode(changeNode);
          }
        }
      });
    }
  }, {
    key: "changeAccessibleDom",
    value: function changeAccessibleDom(changeList) {
      var _this6 = this;

      if (this.accessibleDomRoot.children.length === 0) {
        var root = document.createElement('div');
        root.id = this.getAccessNodeId(this.engineNodeRoot.hashCode);
        this.accessibleDomRoot.appendChild(root);
        this.updateDom(this.engineNodeRoot, root, true);
      }

      changeList.forEach(function (change) {
        var id = _this6.getAccessNodeId(change.accessibleId);

        if (change.type === 'delete') {
          var dom = document.getElementById(id);

          if (dom) {
            dom.remove();
          }
        } else {
          var parentId = _this6.getAccessNodeId(change.virtualParentAccessibleId);

          var parentDom = document.getElementById(parentId);

          if (parentDom) {
            var domType = {
              container: 'div',
              label: 'div',
              button: 'button',
              ul: 'ul',
              li: 'li',
              group: 'div'
            };

            var _dom = document.createElement(domType[change.nodeType]);

            _dom.id = _this6.getAccessNodeId(change.accessibleId);
            var broDom = parentDom.children[change.index || parentDom.children.length];
            parentDom.insertBefore(_dom, broDom);

            var changeNode = _this6.engineNodeMap.get(change.accessibleId);

            if (changeNode) {
              _this6.updateDom(changeNode, _dom);
            }
          }
        }
      });
    }
  }, {
    key: "createAccessibleDom",
    value: function createAccessibleDom() {
      var _this7 = this;

      var doc = document.createDocumentFragment();
      var domType = {
        container: 'div',
        label: 'div',
        button: 'button',
        ul: 'ul',
        li: 'li'
      };

      var run = function run(root, domRoot) {
        var dom = document.createElement(domType[root.nodeType]);
        dom.id = _this7.getAccessNodeId(root.accessibleId);
        domRoot.appendChild(dom);

        var state = _this7.engineNodeMap.get(root.accessibleId);

        _this7.updateDom(state, dom);

        root.children.forEach(function (child) {
          run(child, dom);
        });
      };

      run(this.virtualTree, doc);
      this.accessibleDomRoot.innerHTML = '';
      this.accessibleDomRoot.appendChild(doc);
    }
  }, {
    key: "updateVirtualTree",
    value: function updateVirtualTree() {
      this.oldVirtualTree = this.virtualTree;
      this.virtualTree = {
        accessibleId: "".concat(this.engineNodeRoot.hashCode),
        virtualParent: null,
        parentAccessibleId: '',
        children: [],
        nodeType: 'container',
        engineNode: this.engineNodeRoot
      };
      this.deepUpdateVirtualTree(this.engineNodeRoot);
    }
  }, {
    key: "deepUpdateVirtualTree",
    value: function deepUpdateVirtualTree(root) {
      var _this8 = this;

      if (!this.isWrapperNode(root)) {
        return;
      }

      root.$children.forEach(function (child) {
        if (child.isAccessibilityNode) {
          var parent = _this8.getAccessibleVirtualParent(child);

          var vNode = {
            parentAccessibleId: child.parent.accessibleId,
            virtualParent: parent,
            accessibleId: child.accessibleId,
            nodeType: child.type,
            children: [],
            engineNode: child
          };
          child.$$accessibleVirtualNode = vNode;
          parent.children.push(vNode);
        }

        if (child.checkChildrenAccessible !== false) {
          _this8.deepUpdateVirtualTree(child);
        }
      });
    }
  }, {
    key: "compareVirtualTree",
    value: function compareVirtualTree() {
      var list = [];

      var deepCompare = function deepCompare(oldTree, newTree) {
        if (!oldTree && !newTree) {
          return;
        }

        if (!oldTree && newTree) {
          list.push({
            type: 'add',
            accessibleId: newTree.accessibleId,
            virtualParentAccessibleId: newTree.virtualParent ? newTree.virtualParent.accessibleId : '',
            nodeType: newTree.nodeType
          });
          newTree.children.forEach(function (child) {
            deepCompare(undefined, child);
          });
        } else if (!newTree && oldTree) {
          list.push({
            type: 'delete',
            accessibleId: oldTree.accessibleId,
            virtualParentAccessibleId: oldTree.virtualParent ? oldTree.virtualParent.accessibleId : '',
            nodeType: oldTree.nodeType
          });
          oldTree.children.forEach(function (child) {
            deepCompare(child, undefined);
          });
        } else if (oldTree && newTree && oldTree.accessibleId !== newTree.accessibleId) {
          list.push({
            type: 'delete',
            accessibleId: oldTree.accessibleId,
            virtualParentAccessibleId: oldTree.virtualParent ? oldTree.virtualParent.accessibleId : '',
            nodeType: oldTree.nodeType
          });
          list.push({
            type: 'add',
            accessibleId: newTree.accessibleId,
            virtualParentAccessibleId: newTree.virtualParent ? newTree.virtualParent.accessibleId : '',
            nodeType: newTree.nodeType,
            index: newTree.virtualParent ? newTree.virtualParent.children.findIndex(function (child) {
              return child.accessibleId === newTree.accessibleId;
            }) : 0
          });
          oldTree.children.forEach(function (child) {
            deepCompare(child, undefined);
          });
          newTree.children.forEach(function (child) {
            deepCompare(undefined, child);
          });
        } else if (oldTree && newTree && oldTree.accessibleId === newTree.accessibleId) {
          var length = Math.max(oldTree.children.length, newTree.children.length);

          for (var _i3 = 0; _i3 < length; _i3++) {
            deepCompare(oldTree.children[_i3], newTree.children[_i3]);
          }
        }
      };

      deepCompare(this.oldVirtualTree, this.virtualTree);
      return list;
    }
  }, {
    key: "clearAccessibleView",
    value: function clearAccessibleView(container) {
      if (this.runtime === 'html5') {
        if (container) {
          var id = this.getAccessNodeId(container.accessibleId);
          var dom = document.getElementById(id);

          if (dom) {
            dom.innerHTML = '';
          }

          return;
        }

        this.accessibleDomRoot.innerHTML = '';
        this.accessibleDomRoot.style.display = 'none';
      } else if (this.runtime === 'native') {
        this.deleteNativeNode(container);
      }
    } // TODO:

  }, {
    key: "updateDom",
    value: function updateDom(node, dom) {
      var _this9 = this;

      var isRoot = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      var _a, _b, _c;

      var accessDataKeys = ['accessRole', 'accessLabel', 'accessValue', 'accessChecked', 'accessHidden', 'accessDisabled'];
      var parentDom = dom.parentElement;
      var egretPos = node.localToGlobal();
      var parentLeft = 0;
      var parentTop = 0;

      if (parentDom && !isRoot) {
        parentLeft = parseFloat(((_a = parentDom.attributes.getNamedItem('realLeft')) === null || _a === void 0 ? void 0 : _a.nodeValue) || parentDom.style.left);
        parentTop = parseFloat(((_b = parentDom.attributes.getNamedItem('realTop')) === null || _b === void 0 ? void 0 : _b.nodeValue) || parentDom.style.top);
      }

      var realLeft = egretPos.x * this.scaleX; // 相对于root的偏移量

      var realTop = egretPos.y * this.scaleY; // 相对于root的偏移量

      dom.setAttribute('realLeft', "".concat(realLeft));
      dom.setAttribute('realTop', "".concat(realTop));
      var left = realLeft - parentLeft;
      var top = realTop - parentTop;
      var text = node.text,
          textWidth = node.textWidth,
          textHeight = node.textHeight,
          nWidth = node.width,
          nHeight = node.height;
      var width = (text ? textWidth : nWidth) * this.scaleX;
      var height = (text ? textHeight : nHeight) * this.scaleY;
      dom.style.top = "".concat(top, "px");
      dom.style.left = "".concat(left, "px");
      dom.style.width = "".concat(width, "px");
      dom.style.height = "".concat(height, "px");
      dom.style.display = node.visible === false ? 'none' : 'block';

      if (node.accessibleId === this.maskSettingForOtherBroEl.maskSelfNodeId) {
        (_c = dom.parentNode) === null || _c === void 0 ? void 0 : _c.childNodes.forEach(function (d) {
          if (d.id === _this9.getAccessNodeId(_this9.maskSettingForOtherBroEl.maskSelfNodeId)) return;
          d.style.display = _this9.maskSettingForOtherBroEl.otherVisible ? 'block' : 'none';
        });
      }

      dom.classList.add('accessible-base');

      if (node.type === 'label') {
        dom.innerText = node.text;
      }

      if (node.type === 'container') {
        dom.style.overflow = 'initial';
      }

      if (dom.tagName === 'UL' || node['accessRole'] === 'list') {
        dom.style.overflow = 'scroll';
        dom.addEventListener('scroll', function (ev) {
          node.$parent.viewport.scrollV = ev.target.scrollTop / _this9.scaleY;
          node.$parent.viewport.scrollH = ev.target.scrollLeft / _this9.scaleX;
        });
      }

      accessDataKeys.forEach(function (key) {
        if (node[key] !== undefined && node[key] !== '') {
          dom.setAttribute(accessKeyToAriaKey(key), node[key]);
        }
      });
    }
  }, {
    key: "getAccessNodeId",
    value: function getAccessNodeId(accessibleId) {
      if (typeof accessibleId === 'string' && accessibleId.startsWith(AccessibleController.ID_PREFIX)) {
        return accessibleId;
      }

      return "".concat(AccessibleController.ID_PREFIX, "-").concat(accessibleId);
    }
  }, {
    key: "isWrapperNode",
    value: function isWrapperNode(node) {
      return !!node.$children;
    }
  }, {
    key: "getAccessibleVirtualParent",
    value: function getAccessibleVirtualParent(node) {
      var n = node;
      var root = this.engineNodeRoot;

      while (n && n !== root) {
        var p = n.parent;

        if (!p) {
          return this.virtualTree;
        }

        var _node = this.searchVirtualNode(p.accessibleId);

        if (_node) {
          return _node;
        }

        n = p;
      }

      return this.virtualTree;
    }
  }, {
    key: "searchVirtualNode",
    value: function searchVirtualNode(accessibleId) {
      var run = function run(node, accessibleId) {
        if (accessibleId === node.accessibleId) {
          return node;
        }

        for (var _i4 = 0; _i4 < node.children.length; _i4++) {
          var res = run(node.children[_i4], accessibleId);

          if (res) {
            return res;
          }
        }

        return null;
      };

      return run(this.virtualTree, accessibleId);
    }
  }, {
    key: "updateOtherBroVisible",
    value: function updateOtherBroVisible(visible, selfNode) {
      this.maskSettingForOtherBroEl = {
        maskSelfNodeId: selfNode.accessibleId,
        otherVisible: visible
      };
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!this.instance) {
        this.instance = new AccessibleController();
      }

      return this.instance;
    }
  }]);

  return AccessibleController;
}();

AccessibleController.ID_PREFIX = 'game-access';

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function set(target, property, value, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.set) {
    set = Reflect.set;
  } else {
    set = function set(target, property, value, receiver) {
      var base = _superPropBase(target, property);
      var desc;

      if (base) {
        desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.set) {
          desc.set.call(receiver, value);
          return true;
        } else if (!desc.writable) {
          return false;
        }
      }

      desc = Object.getOwnPropertyDescriptor(receiver, property);

      if (desc) {
        if (!desc.writable) {
          return false;
        }

        desc.value = value;
        Object.defineProperty(receiver, property, desc);
      } else {
        _defineProperty(receiver, property, value);
      }

      return true;
    };
  }

  return set(target, property, value, receiver);
}

function _set(target, property, value, receiver, isStrict) {
  var s = set(target, property, value, receiver || target);

  if (!s && isStrict) {
    throw new Error('failed to set property');
  }

  return value;
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }

  return _assertThisInitialized(self);
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function _createSuper$4(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$4(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$4() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var AccessibleButton = /*#__PURE__*/function (_eui$Button) {
  _inherits(AccessibleButton, _eui$Button);

  var _super = _createSuper$4(AccessibleButton);

  function AccessibleButton() {
    var _this;

    _classCallCheck(this, AccessibleButton);

    _this = _super.apply(this, arguments);
    _this.isBatch = false;
    _this.type = 'button';
    _this._groupID = '';
    _this._isAccessibilityNode = false;
    _this._checkChildrenAccessable = true;
    _this._accessRole = '';
    _this._accessLabel = '';
    _this._accessValue = '';
    _this._accessChecked = false;
    _this._accessHidden = false;
    _this._accessDisabled = false;
    _this._x = 0;
    _this._y = 0;
    _this._width = 0;
    _this._height = 0;
    _this._touchEnabled = true;
    _this._visible = true;
    return _this;
  }

  _createClass(AccessibleButton, [{
    key: "accessibleId",
    get: function get() {
      return "".concat(this.hashCode);
    }
  }, {
    key: "groupID",
    get: function get() {
      return this._groupID;
    },
    set: function set(id) {
      this._groupID = id;
      this.updateAccessibleView();
    }
  }, {
    key: "isAccessibilityNode",
    get: function get() {
      return this._isAccessibilityNode;
    },
    set: function set(isNode) {
      this._isAccessibilityNode = isNode;

      if (isNode) {
        this.firstPaintAccessibleView();
      } else {
        AccessibleController.getInstance().deleteAccessibleView(this);
      }
    }
  }, {
    key: "checkChildrenAccessible",
    get: function get() {
      return this._checkChildrenAccessable;
    },
    set: function set(checked) {
      this._checkChildrenAccessable = checked;

      if (checked) {
        this.firstPaintAccessibleView();
      } else {
        AccessibleController.getInstance().clearAccessibleView(this);
      }
    }
  }, {
    key: "accessRole",
    get: function get() {
      return this._accessRole;
    },
    set: function set(role) {
      this._accessRole = role;
      this.updateAccessibleView();
    }
  }, {
    key: "accessLabel",
    get: function get() {
      return this._accessLabel;
    },
    set: function set(label) {
      this._accessLabel = label;
      this.updateAccessibleView();
    }
  }, {
    key: "accessValue",
    get: function get() {
      return this._accessValue;
    },
    set: function set(height) {
      this._accessValue = height;
      this.updateAccessibleView();
    }
  }, {
    key: "accessChecked",
    get: function get() {
      return this._accessChecked;
    },
    set: function set(checked) {
      this._accessChecked = checked;
      this.updateAccessibleView();
    }
  }, {
    key: "accessHidden",
    get: function get() {
      return this._accessHidden;
    },
    set: function set(hide) {
      this._accessHidden = hide;
      this.updateAccessibleView();
    }
  }, {
    key: "accessDisabled",
    get: function get() {
      return this._accessDisabled;
    },
    set: function set(disabled) {
      this._accessDisabled = disabled;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "x",
    get: function get() {
      return this._x;
    },
    set: function set(x) {
      _set(_getPrototypeOf(AccessibleButton.prototype), "x", x, this, true);

      this._x = x;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "y",
    get: function get() {
      return this._y;
    },
    set: function set(y) {
      _set(_getPrototypeOf(AccessibleButton.prototype), "y", y, this, true);

      this._y = y;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "width",
    get: function get() {
      return this._width;
    },
    set: function set(w) {
      _set(_getPrototypeOf(AccessibleButton.prototype), "width", w, this, true);

      this._width = w;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "height",
    get: function get() {
      return this._height;
    },
    set: function set(h) {
      _set(_getPrototypeOf(AccessibleButton.prototype), "height", h, this, true);

      this._height = h;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "touchEnabled",
    get: function get() {
      return this._touchEnabled;
    },
    set: function set(enabled) {
      _set(_getPrototypeOf(AccessibleButton.prototype), "touchEnabled", enabled, this, true);

      this._touchEnabled = enabled;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "visible",
    get: function get() {
      return this._visible;
    },
    set: function set(enabled) {
      _set(_getPrototypeOf(AccessibleButton.prototype), "visible", enabled, this, true);

      this._visible = enabled;
      this.updateAccessibleView();
    }
  }, {
    key: "childrenCreated",
    value: function childrenCreated() {
      SmartEvent.handleOnceUIEvent(this, egret.Event.REMOVED_FROM_STAGE, this._destroy, this);
      this.firstPaintAccessibleView();
    }
  }, {
    key: "_destroy",
    value: function _destroy() {
      AccessibleController.getInstance().deleteAccessibleView(this);
    }
  }, {
    key: "firstPaintAccessibleView",
    value: function firstPaintAccessibleView() {
      if (this.isBatch) {
        return;
      }

      AccessibleController.getInstance().firstPaintAccessibleView(this);
    }
  }, {
    key: "updateAccessibleView",
    value: function updateAccessibleView() {
      if (this.isBatch) {
        return;
      }

      AccessibleController.getInstance().updateSelfAccessibleView(this);
    }
  }, {
    key: "setAccessDataInBatch",
    value: function setAccessDataInBatch(accessInfo) {
      var _this2 = this;

      var isInBigBatch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.isBatch = true;
      var keys = Object.keys(accessInfo);
      keys.forEach(function (key) {
        _this2[key] = accessInfo[key];
      });

      if (isInBigBatch) {
        this.isBatch = false;
      }

      this.updateAccessibleView();
    }
  }, {
    key: "setAttrInBatch",
    value: function setAttrInBatch(attr) {
      var _this3 = this;

      var isInBigBatch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.isBatch = true;
      var keys = Object.keys(attr);
      keys.forEach(function (key) {
        _this3[key] = attr[key];
      });

      if (!isInBigBatch) {
        this.isBatch = false;
      }

      this.updateAccessibleView();
    }
  }, {
    key: "setInfoInBatch",
    value: function setInfoInBatch(info) {
      var accessData = info.accessData,
          display = info.display;
      this.isBatch = true;
      this.setAccessDataInBatch(accessData);
      this.setAttrInBatch(display);
      this.isBatch = false;
      this.updateAccessibleView();
    }
  }]);

  return AccessibleButton;
}(eui.Button);

__decorate([enumerable(true)], AccessibleButton.prototype, "x", null);

__decorate([enumerable(true)], AccessibleButton.prototype, "y", null);

__decorate([enumerable(true)], AccessibleButton.prototype, "width", null);

__decorate([enumerable(true)], AccessibleButton.prototype, "height", null);

__decorate([enumerable(true)], AccessibleButton.prototype, "touchEnabled", null);

__decorate([enumerable(true)], AccessibleButton.prototype, "visible", null);

function _createSuper$3(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$3(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$3() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var AccessibleContainer = /*#__PURE__*/function (_eui$Component) {
  _inherits(AccessibleContainer, _eui$Component);

  var _super = _createSuper$3(AccessibleContainer);

  function AccessibleContainer() {
    var _this;

    _classCallCheck(this, AccessibleContainer);

    _this = _super.apply(this, arguments);
    _this.isBatch = false;
    _this.type = 'container';
    _this._groupID = '';
    _this._isAccessibilityNode = false;
    _this._checkChildrenAccessable = true;
    _this._accessRole = '';
    _this._accessLabel = '';
    _this._accessValue = '';
    _this._accessChecked = false;
    _this._accessHidden = false;
    _this._accessDisabled = false;
    _this._x = 0;
    _this._y = 0;
    _this._width = 0;
    _this._height = 0;
    _this._touchEnabled = true;
    _this._visible = true;
    return _this;
  }

  _createClass(AccessibleContainer, [{
    key: "accessibleId",
    get: function get() {
      return "".concat(this.hashCode);
    }
  }, {
    key: "groupID",
    get: function get() {
      return this._groupID;
    },
    set: function set(id) {
      this._groupID = id;
      this.updateAccessibleView();
    }
  }, {
    key: "isAccessibilityNode",
    get: function get() {
      return this._isAccessibilityNode;
    },
    set: function set(isNode) {
      this._isAccessibilityNode = isNode;

      if (isNode) {
        this.firstPaintAccessibleView();
      } else {
        AccessibleController.getInstance().deleteAccessibleView(this);
      }
    }
  }, {
    key: "checkChildrenAccessible",
    get: function get() {
      return this._checkChildrenAccessable;
    },
    set: function set(checked) {
      this._checkChildrenAccessable = checked;

      if (checked) {
        this.firstPaintAccessibleView();
      } else {
        AccessibleController.getInstance().clearAccessibleView(this);
      }
    }
  }, {
    key: "accessRole",
    get: function get() {
      return this._accessRole;
    },
    set: function set(role) {
      this._accessRole = role;
      this.updateAccessibleView();
    }
  }, {
    key: "accessLabel",
    get: function get() {
      return this._accessLabel;
    },
    set: function set(label) {
      this._accessLabel = label;
      this.updateAccessibleView();
    }
  }, {
    key: "accessValue",
    get: function get() {
      return this._accessValue;
    },
    set: function set(height) {
      this._accessValue = height;
      this.updateAccessibleView();
    }
  }, {
    key: "accessChecked",
    get: function get() {
      return this._accessChecked;
    },
    set: function set(checked) {
      this._accessChecked = checked;
      this.updateAccessibleView();
    }
  }, {
    key: "accessHidden",
    get: function get() {
      return this._accessHidden;
    },
    set: function set(hide) {
      this._accessHidden = hide;
      this.updateAccessibleView();
    }
  }, {
    key: "accessDisabled",
    get: function get() {
      return this._accessDisabled;
    },
    set: function set(disabled) {
      this._accessDisabled = disabled;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "x",
    get: function get() {
      return this._x;
    },
    set: function set(x) {
      _set(_getPrototypeOf(AccessibleContainer.prototype), "x", x, this, true);

      this._x = x;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "y",
    get: function get() {
      return this._y;
    },
    set: function set(y) {
      _set(_getPrototypeOf(AccessibleContainer.prototype), "y", y, this, true);

      this._y = y;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "width",
    get: function get() {
      return this._width;
    },
    set: function set(w) {
      _set(_getPrototypeOf(AccessibleContainer.prototype), "width", w, this, true);

      this._width = w;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "height",
    get: function get() {
      return this._height;
    },
    set: function set(h) {
      _set(_getPrototypeOf(AccessibleContainer.prototype), "height", h, this, true);

      this._height = h;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "touchEnabled",
    get: function get() {
      return this._touchEnabled;
    },
    set: function set(enabled) {
      _set(_getPrototypeOf(AccessibleContainer.prototype), "touchEnabled", enabled, this, true);

      this._touchEnabled = enabled;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "visible",
    get: function get() {
      return this._visible;
    },
    set: function set(enabled) {
      _set(_getPrototypeOf(AccessibleContainer.prototype), "visible", enabled, this, true);

      this._visible = enabled;
      this.updateAccessibleView();
    }
  }, {
    key: "childrenCreated",
    value: function childrenCreated() {
      SmartEvent.handleOnceUIEvent(this, egret.Event.REMOVED_FROM_STAGE, this._destroy, this);
      this.firstPaintAccessibleView();
    }
  }, {
    key: "_destroy",
    value: function _destroy() {
      AccessibleController.getInstance().deleteAccessibleView(this);
    }
  }, {
    key: "firstPaintAccessibleView",
    value: function firstPaintAccessibleView() {
      if (this.isBatch) {
        return;
      }

      AccessibleController.getInstance().firstPaintAccessibleView(this);
    }
  }, {
    key: "updateAccessibleView",
    value: function updateAccessibleView() {
      if (this.isBatch) {
        return;
      }

      AccessibleController.getInstance().updateSelfAccessibleView(this);
    }
  }, {
    key: "setAttrInBatch",
    value: function setAttrInBatch(attr) {
      var _this2 = this;

      var isInBigBatch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.isBatch = true;
      var keys = Object.keys(attr);
      keys.forEach(function (key) {
        _this2[key] = attr[key];
      });

      if (!isInBigBatch) {
        this.isBatch = false;
      }

      this.updateAccessibleView();
    }
  }, {
    key: "setInfoInBatch",
    value: function setInfoInBatch(info) {
      var display = info.display;
      this.isBatch = true;
      this.setAttrInBatch(display);
      this.isBatch = false;
      this.updateAccessibleView();
    }
  }]);

  return AccessibleContainer;
}(eui.Component);

__decorate([enumerable(true)], AccessibleContainer.prototype, "x", null);

__decorate([enumerable(true)], AccessibleContainer.prototype, "y", null);

__decorate([enumerable(true)], AccessibleContainer.prototype, "width", null);

__decorate([enumerable(true)], AccessibleContainer.prototype, "height", null);

__decorate([enumerable(true)], AccessibleContainer.prototype, "touchEnabled", null);

__decorate([enumerable(true)], AccessibleContainer.prototype, "visible", null);

function _get() {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);
      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(arguments.length < 3 ? target : receiver);
      }

      return desc.value;
    };
  }

  return _get.apply(this, arguments);
}

function _createSuper$2(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$2(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$2() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var AccessibleLabel = /*#__PURE__*/function (_eui$Label) {
  _inherits(AccessibleLabel, _eui$Label);

  var _super = _createSuper$2(AccessibleLabel);

  function AccessibleLabel() {
    var _this;

    _classCallCheck(this, AccessibleLabel);

    _this = _super.apply(this, arguments);
    _this.isBatch = false;
    _this.type = 'label';
    _this._groupID = '';
    _this._isAccessibilityNode = false;
    _this._checkChildrenAccessable = true;
    _this._accessRole = '';
    _this._accessLabel = '';
    _this._accessValue = '';
    _this._accessChecked = false;
    _this._accessHidden = false;
    _this._accessDisabled = false;
    _this._x = 0;
    _this._y = 0;
    _this._width = 0;
    _this._height = 0;
    _this._touchEnabled = true;
    _this._visible = true;
    return _this;
  }

  _createClass(AccessibleLabel, [{
    key: "accessibleId",
    get: function get() {
      return "".concat(this.hashCode);
    }
  }, {
    key: "groupID",
    get: function get() {
      return this._groupID;
    },
    set: function set(id) {
      this._groupID = id;
      this.updateAccessibleView();
    }
  }, {
    key: "isAccessibilityNode",
    get: function get() {
      return this._isAccessibilityNode;
    },
    set: function set(isNode) {
      this._isAccessibilityNode = isNode;

      if (isNode) {
        this.firstPaintAccessibleView();
      } else {
        AccessibleController.getInstance().deleteAccessibleView(this);
      }
    }
  }, {
    key: "checkChildrenAccessible",
    get: function get() {
      return this._checkChildrenAccessable;
    },
    set: function set(checked) {
      this._checkChildrenAccessable = checked;

      if (checked) {
        this.firstPaintAccessibleView();
      } else {
        AccessibleController.getInstance().clearAccessibleView(this);
      }
    }
  }, {
    key: "accessRole",
    get: function get() {
      return this._accessRole;
    },
    set: function set(role) {
      this._accessRole = role;
      this.updateAccessibleView();
    }
  }, {
    key: "accessLabel",
    get: function get() {
      return this._accessLabel;
    },
    set: function set(label) {
      this._accessLabel = label;
      this.updateAccessibleView();
    }
  }, {
    key: "accessValue",
    get: function get() {
      return this._accessValue;
    },
    set: function set(height) {
      this._accessValue = height;
      this.updateAccessibleView();
    }
  }, {
    key: "accessChecked",
    get: function get() {
      return this._accessChecked;
    },
    set: function set(checked) {
      this._accessChecked = checked;
      this.updateAccessibleView();
    }
  }, {
    key: "accessHidden",
    get: function get() {
      return this._accessHidden;
    },
    set: function set(hide) {
      this._accessHidden = hide;
      this.updateAccessibleView();
    }
  }, {
    key: "accessDisabled",
    get: function get() {
      return this._accessDisabled;
    },
    set: function set(disabled) {
      this._accessDisabled = disabled;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "x",
    get: function get() {
      return this._x;
    },
    set: function set(x) {
      _set(_getPrototypeOf(AccessibleLabel.prototype), "x", x, this, true);

      this._x = x;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "y",
    get: function get() {
      return this._y;
    },
    set: function set(y) {
      _set(_getPrototypeOf(AccessibleLabel.prototype), "y", y, this, true);

      this._y = y;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "width",
    get: function get() {
      return this._width;
    },
    set: function set(w) {
      _set(_getPrototypeOf(AccessibleLabel.prototype), "width", w, this, true);

      this._width = w;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "height",
    get: function get() {
      return _get(_getPrototypeOf(AccessibleLabel.prototype), "height", this);
    },
    set: function set(h) {
      _set(_getPrototypeOf(AccessibleLabel.prototype), "height", h, this, true);

      this._height = h;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "touchEnabled",
    get: function get() {
      return this._touchEnabled;
    },
    set: function set(enabled) {
      _set(_getPrototypeOf(AccessibleLabel.prototype), "touchEnabled", enabled, this, true);

      this._touchEnabled = enabled;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "visible",
    get: function get() {
      return this._visible;
    },
    set: function set(enabled) {
      _set(_getPrototypeOf(AccessibleLabel.prototype), "visible", enabled, this, true);

      this._visible = enabled;
      this.updateAccessibleView();
    }
  }, {
    key: "childrenCreated",
    value: function childrenCreated() {
      SmartEvent.handleOnceUIEvent(this, egret.Event.REMOVED_FROM_STAGE, this._destroy, this);
      this.firstPaintAccessibleView();
    }
  }, {
    key: "_destroy",
    value: function _destroy() {
      AccessibleController.getInstance().deleteAccessibleView(this);
    }
  }, {
    key: "firstPaintAccessibleView",
    value: function firstPaintAccessibleView() {
      if (this.isBatch) {
        return;
      }

      AccessibleController.getInstance().firstPaintAccessibleView(this);
    }
  }, {
    key: "updateAccessibleView",
    value: function updateAccessibleView() {
      if (this.isBatch) {
        return;
      }

      AccessibleController.getInstance().updateSelfAccessibleView(this);
    }
  }, {
    key: "setAccessDataInBatch",
    value: function setAccessDataInBatch(accessInfo) {
      var _this2 = this;

      var isInBigBatch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.isBatch = true;
      var keys = Object.keys(accessInfo);
      keys.forEach(function (key) {
        _this2[key] = accessInfo[key];
      });

      if (isInBigBatch) {
        this.isBatch = false;
      }

      this.updateAccessibleView();
    }
  }, {
    key: "setAttrInBatch",
    value: function setAttrInBatch(attr) {
      var _this3 = this;

      var isInBigBatch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.isBatch = true;
      var keys = Object.keys(attr);
      keys.forEach(function (key) {
        _this3[key] = attr[key];
      });

      if (!isInBigBatch) {
        this.isBatch = false;
      }

      this.updateAccessibleView();
    }
  }, {
    key: "setInfoInBatch",
    value: function setInfoInBatch(info) {
      var accessData = info.accessData,
          display = info.display;
      this.isBatch = true;
      this.setAccessDataInBatch(accessData);
      this.setAttrInBatch(display);
      this.isBatch = false;
      this.updateAccessibleView();
    }
  }]);

  return AccessibleLabel;
}(eui.Label);

__decorate([enumerable(true)], AccessibleLabel.prototype, "x", null);

__decorate([enumerable(true)], AccessibleLabel.prototype, "y", null);

__decorate([enumerable(true)], AccessibleLabel.prototype, "width", null);

__decorate([enumerable(true)], AccessibleLabel.prototype, "height", null);

__decorate([enumerable(true)], AccessibleLabel.prototype, "touchEnabled", null);

__decorate([enumerable(true)], AccessibleLabel.prototype, "visible", null);

function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$1() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var AccessibleGroup = /*#__PURE__*/function (_eui$Group) {
  _inherits(AccessibleGroup, _eui$Group);

  var _super = _createSuper$1(AccessibleGroup);

  function AccessibleGroup() {
    var _this;

    _classCallCheck(this, AccessibleGroup);

    _this = _super.apply(this, arguments);
    _this.isBatch = false;
    _this.type = 'container';
    _this._groupID = '';
    _this._isAccessibilityNode = false;
    _this._checkChildrenAccessable = true;
    _this._accessRole = '';
    _this._accessLabel = '';
    _this._accessValue = '';
    _this._accessChecked = false;
    _this._accessHidden = false;
    _this._accessDisabled = false;
    _this._x = 0;
    _this._y = 0;
    _this._width = 0;
    _this._height = 0;
    _this._touchEnabled = true;
    _this._visible = true;
    return _this;
  }

  _createClass(AccessibleGroup, [{
    key: "accessibleId",
    get: function get() {
      return "".concat(this.hashCode);
    }
  }, {
    key: "groupID",
    get: function get() {
      return this._groupID;
    },
    set: function set(id) {
      this._groupID = id;
      this.updateAccessibleView();
    }
  }, {
    key: "isAccessibilityNode",
    get: function get() {
      return this._isAccessibilityNode;
    },
    set: function set(isNode) {
      this._isAccessibilityNode = isNode;

      if (isNode) {
        this.firstPaintAccessibleView();
      } else {
        AccessibleController.getInstance().deleteAccessibleView(this);
      }
    }
  }, {
    key: "checkChildrenAccessible",
    get: function get() {
      return this._checkChildrenAccessable;
    },
    set: function set(checked) {
      this._checkChildrenAccessable = checked;

      if (checked) {
        this.firstPaintAccessibleView();
      } else {
        AccessibleController.getInstance().clearAccessibleView(this);
      }
    }
  }, {
    key: "accessRole",
    get: function get() {
      return this._accessRole;
    },
    set: function set(role) {
      this._accessRole = role;
      this.updateAccessibleView();
    }
  }, {
    key: "accessLabel",
    get: function get() {
      return this._accessLabel;
    },
    set: function set(label) {
      this._accessLabel = label;
      this.updateAccessibleView();
    }
  }, {
    key: "accessValue",
    get: function get() {
      return this._accessValue;
    },
    set: function set(height) {
      this._accessValue = height;
      this.updateAccessibleView();
    }
  }, {
    key: "accessChecked",
    get: function get() {
      return this._accessChecked;
    },
    set: function set(checked) {
      this._accessChecked = checked;
      this.updateAccessibleView();
    }
  }, {
    key: "accessHidden",
    get: function get() {
      return this._accessHidden;
    },
    set: function set(hide) {
      this._accessHidden = hide;
      this.updateAccessibleView();
    }
  }, {
    key: "accessDisabled",
    get: function get() {
      return this._accessDisabled;
    },
    set: function set(disabled) {
      this._accessDisabled = disabled;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "x",
    get: function get() {
      return this._x;
    },
    set: function set(x) {
      _set(_getPrototypeOf(AccessibleGroup.prototype), "x", x, this, true);

      this._x = x;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "y",
    get: function get() {
      return this._y;
    },
    set: function set(y) {
      _set(_getPrototypeOf(AccessibleGroup.prototype), "y", y, this, true);

      this._y = y;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "width",
    get: function get() {
      return this._width;
    },
    set: function set(w) {
      _set(_getPrototypeOf(AccessibleGroup.prototype), "width", w, this, true);

      this._width = w;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "height",
    get: function get() {
      return this._height;
    },
    set: function set(h) {
      _set(_getPrototypeOf(AccessibleGroup.prototype), "height", h, this, true);

      this._height = h;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "touchEnabled",
    get: function get() {
      return this._touchEnabled;
    },
    set: function set(enabled) {
      _set(_getPrototypeOf(AccessibleGroup.prototype), "touchEnabled", enabled, this, true);

      this._touchEnabled = enabled;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "visible",
    get: function get() {
      return this._visible;
    },
    set: function set(enabled) {
      _set(_getPrototypeOf(AccessibleGroup.prototype), "visible", enabled, this, true);

      this._visible = enabled;
      this.updateAccessibleView();
    }
  }, {
    key: "childrenCreated",
    value: function childrenCreated() {
      SmartEvent.handleOnceUIEvent(this, egret.Event.REMOVED_FROM_STAGE, this._destroy, this);
      this.firstPaintAccessibleView();
    }
  }, {
    key: "_destroy",
    value: function _destroy() {
      AccessibleController.getInstance().deleteAccessibleView(this);
    }
  }, {
    key: "firstPaintAccessibleView",
    value: function firstPaintAccessibleView() {
      if (this.isBatch) {
        return;
      }

      AccessibleController.getInstance().firstPaintAccessibleView(this);
    }
  }, {
    key: "updateAccessibleView",
    value: function updateAccessibleView() {
      if (this.isBatch) {
        return;
      }

      AccessibleController.getInstance().updateSelfAccessibleView(this);
    }
  }, {
    key: "setAccessDataInBatch",
    value: function setAccessDataInBatch(accessInfo) {
      var _this2 = this;

      var isInBigBatch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.isBatch = true;
      var keys = Object.keys(accessInfo);
      keys.forEach(function (key) {
        _this2[key] = accessInfo[key];
      });

      if (isInBigBatch) {
        this.isBatch = false;
      }

      this.updateAccessibleView();
    }
  }, {
    key: "setAttrInBatch",
    value: function setAttrInBatch(attr) {
      var _this3 = this;

      var isInBigBatch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.isBatch = true;
      var keys = Object.keys(attr);
      keys.forEach(function (key) {
        _this3[key] = attr[key];
      });

      if (!isInBigBatch) {
        this.isBatch = false;
      }

      this.updateAccessibleView();
    }
  }, {
    key: "setInfoInBatch",
    value: function setInfoInBatch(info) {
      var accessData = info.accessData,
          display = info.display;
      this.isBatch = true;
      this.setAccessDataInBatch(accessData);
      this.setAttrInBatch(display);
      this.isBatch = false;
      this.updateAccessibleView();
    }
  }]);

  return AccessibleGroup;
}(eui.Group);

__decorate([enumerable(true)], AccessibleGroup.prototype, "x", null);

__decorate([enumerable(true)], AccessibleGroup.prototype, "y", null);

__decorate([enumerable(true)], AccessibleGroup.prototype, "width", null);

__decorate([enumerable(true)], AccessibleGroup.prototype, "height", null);

__decorate([enumerable(true)], AccessibleGroup.prototype, "touchEnabled", null);

__decorate([enumerable(true)], AccessibleGroup.prototype, "visible", null);

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var AccessibleList = /*#__PURE__*/function (_eui$List) {
  _inherits(AccessibleList, _eui$List);

  var _super = _createSuper(AccessibleList);

  function AccessibleList() {
    var _this;

    _classCallCheck(this, AccessibleList);

    _this = _super.apply(this, arguments);
    _this.isBatch = false;
    _this.type = 'container';
    _this._groupID = '';
    _this._isAccessibilityNode = false;
    _this._checkChildrenAccessable = true;
    _this._accessRole = '';
    _this._accessLabel = '';
    _this._accessValue = '';
    _this._accessChecked = false;
    _this._accessHidden = false;
    _this._accessDisabled = false;
    _this._x = 0;
    _this._y = 0;
    _this._width = 0;
    _this._height = 0;
    _this._touchEnabled = true;
    _this._visible = true;
    return _this;
  }

  _createClass(AccessibleList, [{
    key: "accessibleId",
    get: function get() {
      return "".concat(this.hashCode);
    }
  }, {
    key: "groupID",
    get: function get() {
      return this._groupID;
    },
    set: function set(id) {
      this._groupID = id;
      this.updateAccessibleView();
    }
  }, {
    key: "isAccessibilityNode",
    get: function get() {
      return this._isAccessibilityNode;
    },
    set: function set(isNode) {
      this._isAccessibilityNode = isNode;

      if (isNode) {
        this.firstPaintAccessibleView();
      } else {
        AccessibleController.getInstance().deleteAccessibleView(this);
      }
    }
  }, {
    key: "checkChildrenAccessible",
    get: function get() {
      return this._checkChildrenAccessable;
    },
    set: function set(checked) {
      this._checkChildrenAccessable = checked;

      if (checked) {
        this.firstPaintAccessibleView();
      } else {
        AccessibleController.getInstance().clearAccessibleView(this);
      }
    }
  }, {
    key: "accessRole",
    get: function get() {
      return this._accessRole;
    },
    set: function set(role) {
      this._accessRole = role;
      this.updateAccessibleView();
    }
  }, {
    key: "accessLabel",
    get: function get() {
      return this._accessLabel;
    },
    set: function set(label) {
      this._accessLabel = label;
      this.updateAccessibleView();
    }
  }, {
    key: "accessValue",
    get: function get() {
      return this._accessValue;
    },
    set: function set(height) {
      this._accessValue = height;
      this.updateAccessibleView();
    }
  }, {
    key: "accessChecked",
    get: function get() {
      return this._accessChecked;
    },
    set: function set(checked) {
      this._accessChecked = checked;
      this.updateAccessibleView();
    }
  }, {
    key: "accessHidden",
    get: function get() {
      return this._accessHidden;
    },
    set: function set(hide) {
      this._accessHidden = hide;
      this.updateAccessibleView();
    }
  }, {
    key: "accessDisabled",
    get: function get() {
      return this._accessDisabled;
    },
    set: function set(disabled) {
      this._accessDisabled = disabled;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "x",
    get: function get() {
      return this._x;
    },
    set: function set(x) {
      _set(_getPrototypeOf(AccessibleList.prototype), "x", x, this, true);

      this._x = x;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "y",
    get: function get() {
      return this._y;
    },
    set: function set(y) {
      _set(_getPrototypeOf(AccessibleList.prototype), "y", y, this, true);

      this._y = y;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "width",
    get: function get() {
      return this._width;
    },
    set: function set(w) {
      _set(_getPrototypeOf(AccessibleList.prototype), "width", w, this, true);

      this._width = w;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "height",
    get: function get() {
      return this._height;
    },
    set: function set(h) {
      _set(_getPrototypeOf(AccessibleList.prototype), "height", h, this, true);

      this._height = h;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "touchEnabled",
    get: function get() {
      return this._touchEnabled;
    },
    set: function set(enabled) {
      _set(_getPrototypeOf(AccessibleList.prototype), "touchEnabled", enabled, this, true);

      this._touchEnabled = enabled;
      this.updateAccessibleView();
    } // @ts-ignore

  }, {
    key: "visible",
    get: function get() {
      return this._visible;
    },
    set: function set(enabled) {
      _set(_getPrototypeOf(AccessibleList.prototype), "visible", enabled, this, true);

      this._visible = enabled;
      this.updateAccessibleView();
    }
  }, {
    key: "childrenCreated",
    value: function childrenCreated() {
      SmartEvent.handleOnceUIEvent(this, egret.Event.REMOVED_FROM_STAGE, this._destroy, this);
      this.firstPaintAccessibleView();
    }
  }, {
    key: "_destroy",
    value: function _destroy() {
      AccessibleController.getInstance().deleteAccessibleView(this);
    }
  }, {
    key: "firstPaintAccessibleView",
    value: function firstPaintAccessibleView() {
      if (this.isBatch) {
        return;
      }

      AccessibleController.getInstance().firstPaintAccessibleView(this);
    }
  }, {
    key: "updateAccessibleView",
    value: function updateAccessibleView() {
      if (this.isBatch) {
        return;
      }

      AccessibleController.getInstance().updateSelfAccessibleView(this);
    }
  }, {
    key: "setAccessDataInBatch",
    value: function setAccessDataInBatch(accessInfo) {
      var _this2 = this;

      var isInBigBatch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.isBatch = true;
      var keys = Object.keys(accessInfo);
      keys.forEach(function (key) {
        _this2[key] = accessInfo[key];
      });

      if (isInBigBatch) {
        this.isBatch = false;
      }

      this.updateAccessibleView();
    }
  }, {
    key: "setAttrInBatch",
    value: function setAttrInBatch(attr) {
      var _this3 = this;

      var isInBigBatch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.isBatch = true;
      var keys = Object.keys(attr);
      keys.forEach(function (key) {
        _this3[key] = attr[key];
      });

      if (isInBigBatch) {
        this.isBatch = false;
      }

      this.updateAccessibleView();
    }
  }, {
    key: "setInfoInBatch",
    value: function setInfoInBatch(info) {
      var accessData = info.accessData,
          display = info.display;
      this.isBatch = true;
      this.setAccessDataInBatch(accessData);
      this.setAttrInBatch(display);
      this.isBatch = false;
      this.updateAccessibleView();
    }
  }]);

  return AccessibleList;
}(eui.List);

__decorate([enumerable(true)], AccessibleList.prototype, "x", null);

__decorate([enumerable(true)], AccessibleList.prototype, "y", null);

__decorate([enumerable(true)], AccessibleList.prototype, "width", null);

__decorate([enumerable(true)], AccessibleList.prototype, "height", null);

__decorate([enumerable(true)], AccessibleList.prototype, "touchEnabled", null);

__decorate([enumerable(true)], AccessibleList.prototype, "visible", null);

export { AccessibleButton, AccessibleContainer, AccessibleController, AccessibleGroup, AccessibleLabel, AccessibleList };
