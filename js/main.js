import { getPreferredTheme } from './utils.js';
import { setThemeIcon } from './themeIcon.js';

const toggleThemeBtn = document.getElementById('toggleTheme');
const core = document.querySelector('.core');
const sunStroke = document.querySelectorAll('.sun-stroke');
const moonShine = document.querySelector('.moon-shine');
const rootEl = document.documentElement;

const iconProps = { core, sunStroke, moonShine, rootEl };

init();

function init() {
  const theme = getPreferredTheme();
  rootEl.setAttribute('data-theme', theme);

  // Set initial icon state
  setThemeIcon(theme, iconProps, true);
}

toggleThemeBtn.addEventListener('click', () => {
  const currentTheme = rootEl.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  rootEl.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  setThemeIcon(newTheme, iconProps, rootEl);
});

window.addEventListener('load', () => {
  rootEl.classList.remove('no-theme-transition');
});
