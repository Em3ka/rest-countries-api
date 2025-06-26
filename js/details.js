import { getPreferredTheme, getToggledTheme, setButtonAttr } from './utils.js';
import { setThemeIcon } from './themeIcon.js';

const buttonLabel = document.getElementById('themeToggleLabel');
const toggleThemeBtn = document.getElementById('themeToggle');
const core = document.querySelector('.core');
const sunRay = document.querySelectorAll('.sun-ray');
const moonRay = document.querySelector('.moon-ray');

const rootEl = document.documentElement;
const iconProps = { core, sunRay, moonRay, rootEl };

init();

function init() {
  initializeThemeToggle();
}

function initializeThemeToggle() {
  // Get user's preferred theme
  const theme = getPreferredTheme();

  // Set initial button attributes
  setButtonAttr({ theme, button: toggleThemeBtn, buttonLabel, rootEl });

  // Set initial button icon state
  setThemeIcon(theme, iconProps, true);
}

toggleThemeBtn.addEventListener('click', function () {
  const newTheme = getToggledTheme(rootEl);
  setButtonAttr({ theme: newTheme, button: this, buttonLabel, rootEl });
  setThemeIcon(newTheme, iconProps, rootEl);
  localStorage.setItem('theme', newTheme);
});
