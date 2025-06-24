import { getPreferredTheme, getBtnAriaLabel } from './utils.js';
import { setThemeIcon } from './themeIcon.js';
import { getCountries } from './countries.js';

const themeToggleLabel = document.getElementById('themeToggleLabel');
const bouncingLoader = document.querySelector('.bouncing-loader');
const countryGrid = document.querySelector('.country-grid');
const statusMessage = document.querySelector('.status-message');
const countrySearch = document.getElementById('countrySearch');
const regionFilter = document.getElementById('region');
const toggleThemeBtn = document.getElementById('themeToggle');
const core = document.querySelector('.core');
const sunRay = document.querySelectorAll('.sun-ray');
const moonRay = document.querySelector('.moon-ray');

const rootEl = document.documentElement;
const iconProps = { core, sunRay, moonRay, rootEl };
let allCountriesArr = [];

init();

function init() {
  initializeThemeToggle();
  initializeCountries();
}

function renderLoader(state) {
  return state
    ? bouncingLoader.removeAttribute('hidden')
    : bouncingLoader.setAttribute('hidden', '');
}

async function initializeCountries() {
  renderLoader(true);
  const countryFields = {
    fields: ['name', 'population', 'flags', 'region', 'capital'],
  };
  try {
    const allCountries = await getCountries(countryFields);
    allCountriesArr = [...allCountries];

    // Defer UI update to allow a paint frame
    requestAnimationFrame(() => {
      filterCountries(allCountries);
    });
  } catch (error) {
    renderError({
      title: 'Failed to load countries',
      body: error.message,
    });
  } finally {
    renderLoader(false);
  }
}

function renderCountry(countryData) {
  const { name, population, flags, region, capital = [] } = countryData;

  const countryHTML = /* html */ `
      <li class="country-card">
        <img
          loading="lazy"
          src="${flags.svg}"
          alt="${flags.alt}" />
        <div class="country-card__details">
          <a href="/details.html">
            <h3>${name.common}</h3>
          </a>
          <p><span class="stat-label">
            Population:</span>${Number(population).toLocaleString()}
          </p>
          <p><span class="stat-label">Region:</span>${region}</p>
          <p><span class="stat-label">Capital:</span>
            ${capital?.[0] || 'N/A'}
          </p>
        </div>
       </li>`;

  countryGrid.insertAdjacentHTML('beforeend', countryHTML);
}

// Note: Fix the aria-label
function renderError(error) {
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

  const errorHTML = /* html */ `
      <img src="/images/status-message.png" alt="" />
      <h2>${title}</h2>
      <p>${body}</p> `;

  statusMessage.insertAdjacentHTML('beforeend', errorHTML);
  statusMessage.setAttribute('aria-hidden', 'true');
  statusMessage.removeAttribute('hidden');
}

const updateRegion = async function (e) {
  const filterName = e.target.value;
  try {
    const regionCountries = allCountriesArr.filter(
      (country) => country.region && country.region === filterName
    );
    filterCountries(regionCountries);
  } catch (err) {
    renderError({
      title: 'Failed to load filtered countries',
      body: err.message,
    });
  }
};

function filterCountries(countries) {
  // Clear the current DOM
  countryGrid.innerHTML = '';

  // Render each new country
  countries.forEach((country) => renderCountry(country));
}

function initializeThemeToggle() {
  // Get user's preferred theme
  const theme = getPreferredTheme();

  // Set initial button attributes
  setButtonAttr(theme);

  // Set initial button icon state
  setThemeIcon(theme, iconProps, true);
}

function setButtonAttr(currentTheme) {
  toggleThemeBtn.setAttribute('aria-label', getBtnAriaLabel(currentTheme));
  toggleThemeBtn.setAttribute(
    'aria-pressed',
    currentTheme === 'dark' ? 'true' : 'false'
  );

  themeToggleLabel.textContent =
    currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
  rootEl.setAttribute('data-theme', currentTheme);
}

toggleThemeBtn.addEventListener('click', () => {
  const currentTheme = rootEl.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  setButtonAttr(newTheme);
  setThemeIcon(newTheme, iconProps, rootEl);
  localStorage.setItem('theme', newTheme);
});

regionFilter.addEventListener('change', updateRegion);

window.addEventListener('load', () =>
  rootEl.classList.remove('no-theme-transition')
);
