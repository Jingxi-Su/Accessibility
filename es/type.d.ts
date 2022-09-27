declare type RUNTIME = 'html5' | 'native';
declare type AccessData = {
    accessRole?: string;
    accessLabel?: string;
    accessValue?: string | number;
    accessChecked?: boolean;
    accessHidden?: boolean;
    accessDisabled?: boolean;
};
declare type EgretAccessDisplayInfo = {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    visible?: boolean;
    touchEnabled?: boolean;
};
declare type NodeType = 'label' | 'button' | 'container' | 'ul' | 'li';
interface AccessibleVirtualNode {
    virtualParent: AccessibleVirtualNode | null;
    parentAccessibleId: string;
    accessibleId: string;
    nodeType: NodeType;
    engineNode: any;
    children: AccessibleVirtualNode[];
}
interface AccessibleEngineContainer {
    readonly accessibleId: string;
    parent: any;
    type: 'container';
    isAccessibilityNode: boolean;
    checkChildrenAccessible: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    touchEnabled: boolean;
    groupID: string;
    visible: boolean;
    $$accessibleVirtualNode: AccessibleVirtualNode;
    $children: any[];
    setAttrInBatch(attr: EgretAccessDisplayInfo): void;
    localToGlobal(): egret.Point;
}
interface AccessibleEngineNode {
    readonly accessibleId: string;
    parent: any;
    type: NodeType;
    isAccessibilityNode: boolean;
    checkChildrenAccessible: boolean;
    accessRole: string;
    accessLabel: string;
    accessValue: number | string;
    accessChecked: boolean;
    accessHidden: boolean;
    accessDisabled: boolean;
    groupID: string;
    x: number;
    y: number;
    width: number;
    height: number;
    touchEnabled: boolean;
    visible: boolean;
    $$accessibleVirtualNode: AccessibleVirtualNode;
    setAccessDataInBatch(accessInfo: AccessData): void;
    setAttrInBatch(attr: EgretAccessDisplayInfo): void;
    localToGlobal(): egret.Point;
}
interface AccessibleEngineStageNode extends AccessibleEngineContainer {
    hashCode: number;
    $children: (AccessibleEngineGroupNode | AccessibleEngineNode | any)[];
}
interface AccessibleEngineContainerNode extends AccessibleEngineContainer {
    $children: (AccessibleEngineGroupNode | AccessibleEngineNode | any)[];
}
interface AccessibleEngineGroupNode extends AccessibleEngineNode {
    $children: (AccessibleEngineGroupNode | AccessibleEngineNode | any)[];
}
interface AccessibleEngineLabelNode extends AccessibleEngineNode {
    text: string;
}
interface AccessibleEngineButtonNode extends AccessibleEngineNode {
}
interface Window {
    bridgeCallHandler: (cmd: any, param: any, callback?: (data: any) => void) => void;
    bridgeCallHandlerPromise: (str: string, data: any, nativeCallbackNeeded: boolean) => Promise<void>;
    bridgeRegisterHandler: (str: string, callback?: (data: any) => void) => void;
    bridgeUnregisterHandler: (name: string) => any;
    bridgeInit: (callback?: () => void) => any;
}
