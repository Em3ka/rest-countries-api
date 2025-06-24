export function getRootStyle(rootEl, cssVariable) {
  return getComputedStyle(rootEl).getPropertyValue(cssVariable);
}

export function getPreferredTheme() {
  return (
    localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light')
  );
}

export function getBtnAriaLabel(theme) {
  return theme === 'dark' ? 'Activate light theme' : 'Activate dark theme';
}

export function getCurrency(currencies) {
  return currencies?.[Object.keys(currencies || {})[0]]?.name || '';
}

export function getLanguages(languages) {
  return Object.values(languages || {})?.join(', ') || '';
}
