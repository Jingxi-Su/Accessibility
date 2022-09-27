/// <reference types="node" />
/**
 * @private
 * 计算舞台显示尺寸
 * @param scaleMode 当前的缩放模式
 * @param screenWidth 播放器视口宽度
 * @param screenHeight 播放器视口高度
 * @param contentWidth 初始化内容宽度
 * @param contentHeight 初始化内容高度
 */
export declare function calculateStageSize(scaleMode: string, screenWidth: number, screenHeight: number, contentWidth: number, contentHeight: number): {
    stageWidth: number;
    stageHeight: number;
    displayWidth: number;
    displayHeight: number;
};
export declare function enumerable(val: boolean): (target: any, properKey: string, descriptor: PropertyDescriptor) => void;
export declare function customRequestIdleCallback(callback: (deadline: {
    didTimeout: boolean;
    timeRemaining: () => number;
}) => void, options?: {
    timeout?: number;
}): number | NodeJS.Timeout;
export declare function customCancelIdleCallback(timeout: any): void;
