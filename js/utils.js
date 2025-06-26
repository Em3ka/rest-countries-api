export function getRootStyle(rootEl, cssVariable) {
  return getComputedStyle(rootEl).getPropertyValue(cssVariable);
}

export function getPreferredTheme() {
  return (
    localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
}

export function getToggledTheme(rootEl) {
  const currentTheme = rootEl.getAttribute('data-theme');
  return currentTheme === 'dark' ? 'light' : 'dark';
}

export function setButtonAttr({ theme, button, buttonLabel, rootEl }) {
  button.setAttribute('aria-label', getBtnAriaLabel(theme));
  button.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  buttonLabel.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  rootEl.setAttribute('data-theme', theme);
}

function getBtnAriaLabel(theme) {
  return theme === 'dark' ? 'Activate light theme' : 'Activate dark theme';
}

export function getCurrency(currencies) {
  return currencies?.[Object.keys(currencies || {})[0]]?.name || '';
}

export function getLanguages(languages) {
  return Object.values(languages || {})?.join(', ') || '';
}
