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

export function removeClassOnLoad(rootEl, className) {
  const onLoad = function () {
    rootEl.classList.remove(className);
    window.removeEventListener('load', onLoad);
  };
  window.addEventListener('load', onLoad);
}

function parseError(error) {
  let title = "Well, that's awkward";
  let body = '';

  if (typeof error === 'string') {
    body = error;
  } else if (error instanceof Error) {
    body = error.message;
  } else if (error?.body) {
    title = error.title ?? title;
    body = error.body;
  } else {
    body = String(error);
  }

  return { title, body };
}

export function renderError(error, containerEl) {
  const { title, body } = parseError(error);

  const errorHTML = /* html */ `
    <img src="/images/status-message.png" alt="Sleeping robot" />
    <h2>${title}</h2>
    <p>${body}</p>
  `;

  containerEl.innerHTML = errorHTML;
  containerEl.removeAttribute('hidden');
}

export function clearError(containerEl) {
  containerEl.innerHTML = '';
  containerEl.setAttribute('hidden', '');
}
