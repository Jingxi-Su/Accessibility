import { SCALE_MODE } from "@/contants/stage";

/**
 * @private
 * 计算舞台显示尺寸
 * @param scaleMode 当前的缩放模式
 * @param screenWidth 播放器视口宽度
 * @param screenHeight 播放器视口高度
 * @param contentWidth 初始化内容宽度
 * @param contentHeight 初始化内容高度
 */

export function calculateStageSize(scaleMode: string, screenWidth: number, screenHeight: number,
  contentWidth: number, contentHeight: number) {
  let displayWidth = screenWidth;
  let displayHeight = screenHeight;
  let stageWidth = contentWidth;
  let stageHeight = contentHeight;
  let scaleX = (screenWidth / stageWidth) || 0;
  let scaleY = (screenHeight / stageHeight) || 0;
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
      }
      else {
        displayWidth = Math.round(stageWidth * scaleY);
      }
      break;
    case SCALE_MODE.SHOW_ALL:
      if (scaleX > scaleY) {
        displayWidth = Math.round(stageWidth * scaleY);
      }
      else {
        displayHeight = Math.round(stageHeight * scaleX);
      }
      break;
    case SCALE_MODE.FIXED_NARROW:
      if (scaleX > scaleY) {
        stageWidth = Math.round(screenWidth / scaleY);
      }
      else {
        stageHeight = Math.round(screenHeight / scaleX);
      }
      break;
    case SCALE_MODE.FIXED_WIDE:
      if (scaleX > scaleY) {
        stageHeight = Math.round(screenHeight / scaleX);
      }
      else {
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

export function enumerable(val: boolean) {
  return function (target: any, properKey: string, descriptor: PropertyDescriptor): void {
    descriptor.enumerable = val;
  };
}

export function customRequestIdleCallback(callback: (deadline: {
  didTimeout: boolean;
  timeRemaining: () => number;
}) => void, options?: {
  timeout?: number;
}) {
  // @ts-ignore
  if (window.requestIdleCallback) {
    // @ts-ignore
    return window.requestIdleCallback(callback, options);
  }

  return setTimeout(() => {
    callback({
      didTimeout: true,
      timeRemaining: () => 60,
    });
  }, options && options.timeout ? options.timeout : 0);
}

export function customCancelIdleCallback(timeout) {
  // @ts-ignore
  if (window.requestIdleCallback) {
    // @ts-ignore
    return window.cancelIdleCallback(timeout);
  }

  return clearTimeout(timeout);
}
