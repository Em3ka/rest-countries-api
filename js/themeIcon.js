import { getRootStyle } from './utils.js';
const { animate } = Motion;

let hasAnimatedShineOnce = false;

const ICON_PATHS = {
  SUN: 'M49 68C59.4934 68 68 59.4934 68 49C68 38.5066 59.4934 30 49 30C38.5066 30 30 38.5066 30 49C30 59.4934 38.5066 68 49 68Z',
  MOON: 'M50 69C60.4934 69 69 60.4934 69 50C48.4888 58.2389 44.0819 45.7667 50 31C39.5066 31 31 39.5066 31 50C31 60.4934 39.5066 69 50 69Z',
};

const VISIBILITY = {
  VISIBLE: 'visible',
  HIDDEN: 'hidden',
};

const CSS_VARS = {
  SUN_COLOR: '--sun-color',
  MOON_COLOR: '--moon-color',
  SUN_STROKE_WIDTH: '--sun-stroke-width',
};

const raysVariants = {
  hidden: {
    strokeOpacity: 0,
  },
  visible: {
    strokeOpacity: 1,
  },
};

const rayVariant = {
  hidden: {
    opacity: 0,
    scale: 0,
  },
  visible: (rootEl) => ({
    opacity: 1,
    scale: 1,
    stroke: getRootStyle(rootEl, CSS_VARS.SUN_COLOR),
    strokeWidth: getRootStyle(rootEl, CSS_VARS.SUN_STROKE_WIDTH),
    transition: {
      duration: 0.5,
      ease: 'easeOut',
      opacity: { duration: 0.2 },
      scale: { duration: 0.3 },
      strokeWidth: { duration: 0.3 },
    },
  }),
};

const shineVariant = {
  hidden: {
    opacity: 0,
    scale: 2,
    strokeDasharray: '20, 1000',
    strokeDashoffset: 0,
    filter: 'blur(0px)',
  },
  visible: (rootEl) => ({
    opacity: [0, 1, 0],
    strokeWidth: 5,
    stroke: getRootStyle(rootEl, CSS_VARS.MOON_COLOR),
    strokeDashoffset: [0, -50, -100],
    filter: ['blur(2px)', 'blur(2px)', 'blur(0px)'],
    transition: {
      duration: 0.75,
      ease: 'linear',
    },
  }),
};

function setThemeIcon(theme, iconProps, isInitial = false) {
  const { core, sunStroke, moonShine, rootEl } = iconProps;
  const sunColor = getRootStyle(rootEl, CSS_VARS.SUN_COLOR);
  const moonColor = getRootStyle(rootEl, CSS_VARS.MOON_COLOR);

  const isLight = theme === 'light';

  animate(core, {
    d: isLight ? ICON_PATHS.SUN : ICON_PATHS.MOON,
    rotate: isLight ? 0 : 360,
    stroke: isLight ? sunColor : moonColor,
    fill: isLight ? sunColor : moonColor,
    fillOpacity: 0.35,
    strokeOpacity: 1,
    scale: isLight ? 1 : 2,
  });

  animate(sunStroke, {
    strokeOpacity: isLight
      ? raysVariants.visible.strokeOpacity
      : raysVariants.hidden.strokeOpacity,
  });

  sunStroke.forEach((ray, i) => {
    setTimeout(() => {
      const variant =
        rayVariant[isLight ? VISIBILITY.VISIBLE : VISIBILITY.HIDDEN];
      const resolved = resolveVariant(variant, rootEl);
      applyVariant(ray, resolved);
    }, i * 50);
  });

  if (!isLight && isInitial && !hasAnimatedShineOnce) {
    applyVariant(moonShine, shineVariant.hidden);
    return;
  }

  const shine = shineVariant[isLight ? VISIBILITY.HIDDEN : VISIBILITY.VISIBLE];
  const resolved = resolveVariant(shine, rootEl);
  applyVariant(moonShine, resolved);

  hasAnimatedShineOnce = true;
}

function resolveVariant(variant, root) {
  return typeof variant === 'function' ? variant(root) : variant;
}

function applyVariant(el, variant) {
  const { transition = {}, ...props } = variant;

  animate(el, props, {
    duration: transition.duration,
    easing: transition.ease,
    ...transition,
  });
}

export { setThemeIcon };
