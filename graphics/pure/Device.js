export default {
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  pixelRatio: Math.min(window.devicePixelRatio, 2),
  scrollTop: 0,
  aspectRatio: 0,
  scrollHeight: 0,
  isMobile:
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ),
  isHovering: false,
};
