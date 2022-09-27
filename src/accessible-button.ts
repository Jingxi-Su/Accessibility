import AccessibleController from './accessible-controller';
import { SmartEvent } from '@game-egret-common/game-util';
import { enumerable } from './utils/stage';

class AccessibleButton extends eui.Button implements AccessibleEngineButtonNode {
  $$accessibleVirtualNode;
  private isBatch = false;
  type: 'button' = 'button';

  get accessibleId() {
    return `${this.hashCode}`;
  }

  private _groupID = '';
  get groupID() {
    return this._groupID;
  }
  set groupID(id: string) {
    this._groupID = id;
    this.updateAccessibleView();
  }

  private _isAccessibilityNode = false;
  get isAccessibilityNode() {
    return this._isAccessibilityNode;
  }
  set isAccessibilityNode(isNode: boolean) {
    this._isAccessibilityNode = isNode;
    if (isNode) {
      this.firstPaintAccessibleView();
    } else {
      AccessibleController.getInstance().deleteAccessibleView(this);
    }
  }

  private _checkChildrenAccessable = true;
  get checkChildrenAccessible() {
    return this._checkChildrenAccessable;
  }
  set checkChildrenAccessible(checked: boolean) {
    this._checkChildrenAccessable = checked;
    if (checked) {
      this.firstPaintAccessibleView();
    } else {
      AccessibleController.getInstance().clearAccessibleView(this);
    }
  }

  private _accessRole = '';
  get accessRole() {
    return this._accessRole;
  }
  set accessRole(role: string) {
    this._accessRole = role;
    this.updateAccessibleView();
  }

  private _accessLabel = '';
  get accessLabel() {
    return this._accessLabel;
  }
  set accessLabel(label: string) {
    this._accessLabel = label;
    this.updateAccessibleView();
  }

  private _accessValue = '' as number | string;
  get accessValue() {
    return this._accessValue;
  }
  set accessValue(height: number | string) {
    this._accessValue = height;
    this.updateAccessibleView();
  }

  private _accessChecked = false;
  get accessChecked() {
    return this._accessChecked;
  }
  set accessChecked(checked: boolean) {
    this._accessChecked = checked;
    this.updateAccessibleView();
  }

  private _accessHidden = false;
  get accessHidden() {
    return this._accessHidden;
  }
  set accessHidden(hide: boolean) {
    this._accessHidden = hide;
    this.updateAccessibleView();
  }

  private _accessDisabled = false;
  get accessDisabled() {
    return this._accessDisabled;
  }
  set accessDisabled(disabled: boolean) {
    this._accessDisabled = disabled;
    this.updateAccessibleView();
  }

  private _x = 0;
  // @ts-ignore
  get x() {
    return this._x;
  }
  @enumerable(true)
  set x(x: number) {
    super.x = x;
    this._x = x;
    this.updateAccessibleView();
  }

  private _y = 0;
  // @ts-ignore
  get y() {
    return this._y;
  }
  @enumerable(true)
  set y(y: number) {
    super.y = y;
    this._y = y;
    this.updateAccessibleView();
  }

  private _width = 0;
  // @ts-ignore
  get width() {
    return this._width;
  }
  @enumerable(true)
  set width(w: number) {
    super.width = w;
    this._width = w;
    this.updateAccessibleView();
  }

  private _height = 0;
  // @ts-ignore
  get height() {
    return this._height;
  }
  @enumerable(true)
  set height(h: number) {
    super.height = h;
    this._height = h;
    this.updateAccessibleView();
  }

  private _touchEnabled = true;
  // @ts-ignore
  get touchEnabled() {
    return this._touchEnabled;
  }
  @enumerable(true)
  set touchEnabled(enabled: boolean) {
    super.touchEnabled = enabled;
    this._touchEnabled = enabled;
    this.updateAccessibleView();
  }

  private _visible = true;
  // @ts-ignore
  get visible() {
    return this._visible;
  }
  @enumerable(true)
  set visible(enabled: boolean) {
    super.visible = enabled;
    this._visible = enabled;
    this.updateAccessibleView();
  }

  childrenCreated() {
    SmartEvent.handleOnceUIEvent(this, egret.Event.REMOVED_FROM_STAGE, this._destroy, this);

    this.firstPaintAccessibleView();
  }

  private _destroy() {
    AccessibleController.getInstance().deleteAccessibleView(this);
  }
  private firstPaintAccessibleView() {
    if (this.isBatch) {
      return;
    }
    AccessibleController.getInstance().firstPaintAccessibleView(this as AccessibleEngineNode);
  }
  private updateAccessibleView() {
    if (this.isBatch) {
      return;
    }
    AccessibleController.getInstance().updateSelfAccessibleView(this as AccessibleEngineNode);
  }
  setAccessDataInBatch(accessInfo: AccessData, isInBigBatch = false) {
    this.isBatch = true;
    const keys = Object.keys(accessInfo);
    keys.forEach((key) => {
      this[key] = accessInfo[key];
    });
    if (isInBigBatch) {
      this.isBatch = false;
    }

    this.updateAccessibleView();
  }

  setAttrInBatch(attr: EgretAccessDisplayInfo, isInBigBatch = false) {
    this.isBatch = true;
    const keys = Object.keys(attr);
    keys.forEach((key) => {
      this[key] = attr[key];
    });
    if (!isInBigBatch) {
      this.isBatch = false;
    }

    this.updateAccessibleView();
  }

  setInfoInBatch(info: {
    accessData: AccessData;
    display: EgretAccessDisplayInfo;
  }) {
    const { accessData, display } = info;
    this.isBatch = true;
    this.setAccessDataInBatch(accessData);
    this.setAttrInBatch(display);
    this.isBatch = false;

    this.updateAccessibleView();
  }
}

export default AccessibleButton;
