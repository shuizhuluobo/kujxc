/**
 * 平台检测工具
 */

// 检测是否为移动端
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// 检测是否为触摸设备
export const isTouchDevice = (): boolean => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

// 检测屏幕宽度
export const isSmallScreen = (): boolean => {
  return window.innerWidth < 768;
};

// 综合判断是否应该使用移动端组件
export const shouldUseMobileUI = (): boolean => {
  return isMobile() || (isTouchDevice() && isSmallScreen());
};

// 获取当前平台
export const getPlatform = (): 'mobile' | 'desktop' => {
  return shouldUseMobileUI() ? 'mobile' : 'desktop';
};
