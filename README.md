# game-accessibility

## AccessibleController

| 方法  | 参数 | 作用 |
| ------ | ------ | --- |
| init | {runtime: RUNTIME; h5EgretPlayerWrapperId: string; designWidth: number; designHeight: number; scaleMode: string;} | 初始化access功能  |
| firstPaintinit | AccessibleEngineStageNode | 首屏绘制，传入stage |
| firstPaintAccessibleView | AccessibleEngineNode | 传入任何节点，首次绘制自身无障碍化相应的节点 |
| updateSelfAccessibleView | AccessibleEngineNode | 传入任何节点，更新自身无障碍化相应的节点 |
| deleteAccessibleView | string | 删除节点，传入节点的id |
| clearAccessibleView | AccessibleEngineNode? | 清空所有无障碍化节点 |

## AccessibleContainer/AccessibleButton/AccessibleLabel

| 属性  | 类型 | 作用 |
| ------ | ------ | --- |
| accessibleId | sting | 引擎节点唯一id  |
| isAccessibilityNode | boolean | 是否对此节点需启无障碍化功能  |
| checkChildrenAccessible | boolean | 是否对子节点进行检查无障碍化信息 |
| accessRole | string | 该节点的角色 |
| accessLabel | string | 该节点的标签，一般在语音中会播报该信息 |
| accessValue | string / number | 该节点的值，一般在输入框中表示 |
| accessChecked | boolean | 该节点的是否被勾选，一般在选择框中表示 |
| accessHidden | boolean | 该节点是否是隐藏状态 |
| accessDisabled | boolean | 该节点是否不可被操作 |


| 方法  | 参数 | 作用 |
| ------ | ------ | --- |
| setAccessDataInBatch | AccessData | 批量初始化无障碍化信息，一次设置只有一次绘制  |
| setAttrInBatch | EgretAccessDisplayInfo | 批量初始化egret属性信息，一次设置只有一次绘制，目前只支持width/height/x/y/touchEnabled/visible |
| setInfoInBatch | { accessData: AccessData; display: EgretAccessDisplayInfo; } | 批量初始化egret属性信息，一次设置只有一次绘制，目前只支持width/height/x/y/touchEnabled/visible |