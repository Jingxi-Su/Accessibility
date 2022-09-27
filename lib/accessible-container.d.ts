declare class AccessibleContainer extends eui.Component implements AccessibleEngineContainerNode {
    $$accessibleVirtualNode: any;
    private isBatch;
    type: 'container';
    get accessibleId(): string;
    private _groupID;
    get groupID(): string;
    set groupID(id: string);
    private _isAccessibilityNode;
    get isAccessibilityNode(): boolean;
    set isAccessibilityNode(isNode: boolean);
    private _checkChildrenAccessable;
    get checkChildrenAccessible(): boolean;
    set checkChildrenAccessible(checked: boolean);
    private _accessRole;
    get accessRole(): string;
    set accessRole(role: string);
    private _accessLabel;
    get accessLabel(): string;
    set accessLabel(label: string);
    private _accessValue;
    get accessValue(): number | string;
    set accessValue(height: number | string);
    private _accessChecked;
    get accessChecked(): boolean;
    set accessChecked(checked: boolean);
    private _accessHidden;
    get accessHidden(): boolean;
    set accessHidden(hide: boolean);
    private _accessDisabled;
    get accessDisabled(): boolean;
    set accessDisabled(disabled: boolean);
    private _x;
    get x(): number;
    set x(x: number);
    private _y;
    get y(): number;
    set y(y: number);
    private _width;
    get width(): number;
    set width(w: number);
    private _height;
    get height(): number;
    set height(h: number);
    private _touchEnabled;
    get touchEnabled(): boolean;
    set touchEnabled(enabled: boolean);
    private _visible;
    get visible(): boolean;
    set visible(enabled: boolean);
    childrenCreated(): void;
    private _destroy;
    private firstPaintAccessibleView;
    private updateAccessibleView;
    setAttrInBatch(attr: EgretAccessDisplayInfo, isInBigBatch?: boolean): void;
    setInfoInBatch(info: {
        display: EgretAccessDisplayInfo;
    }): void;
}
export default AccessibleContainer;
