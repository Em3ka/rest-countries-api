import {
  getCurrency,
  getLanguages,
  getPreferredTheme,
  getToggledTheme,
  setButtonAttr,
  removeClassOnLoad,
  renderError,
  safeGet,
} from './utils.js';
import setThemeIcon from './themeIcon.js';
import { getCountries, getBorderCountryName } from './countries.js';

const countryDetails = document.getElementById('countryDetails');
const countryInfo = document.querySelector('.country-info');
const buttonLabel = document.getElementById('themeToggleLabel');
const toggleThemeBtn = document.getElementById('themeToggle');
const statusMessage = document.querySelector('.status-message');
const core = document.querySelector('.core');
const sunRay = document.querySelectorAll('.sun-ray');
const moonRay = document.querySelector('.moon-ray');

const rootEl = document.documentElement;
const iconProps = { core, sunRay, moonRay, rootEl };

init();

function init() {
  initializeThemeToggle();
  initializeCountry();
}

function initializeThemeToggle() {
  // Get user's preferred theme
  const theme = getPreferredTheme();

  // Set initial button attributes
  setButtonAttr({ theme, button: toggleThemeBtn, buttonLabel, rootEl });

  // Set initial button icon state
  setThemeIcon(theme, iconProps, true);
}

async function initializeCountry() {
  try {
    showSkeleton();
    const name = new URLSearchParams(location.search).get('name');
    if (!name) throw new Error('No country name provided in URL');

    const country = await getCountries(name);
    if (!country || !country.length) throw new Error('Country not found');

    await renderCountry(country[0]);
  } catch (error) {
    console.error(`Failed to fetch: ${error}`);
    hideSkeleton();
    renderError(error, statusMessage);
  }
}

function showSkeleton() {
  countryInfo.innerHTML = /* html */ `
    <div class="country-flag skeleton skeleton-flag"></div>
    <div class="info-text">
      <div class="skeleton skeleton-title"></div>
      <div class="stats-grid">
        <div class="stats-block flow">
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line"></div>
        </div>
        <div class="stats-block flow">
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line"></div>
        </div>
        <div class="stats-block stats-flex">
          <div class="skeleton skeleton-line" style="inline-size: 22ch"></div>
        </div>
      </div>
    </div>
  `;
}

function hideSkeleton() {
  countryInfo.innerHTML = '';
}

async function renderCountry(countryData) {
  countryDetails.setAttribute(
    'aria-label',
    `${safeGet(countryData, 'name.common')} country details`
  );
  const bordersHTML = await renderBorderCountries(countryData);
  const countryHTML = /* html */ `
        <img class="country-flag" 
              src="${safeGet(countryData, 'flags.svg', 'Country flag not available')}"
              alt="${safeGet(countryData, 'flags.alt', 'Country flag alt not available')}" />
          <div class="info-text fade-in">
            <h1>${safeGet(countryData, 'name.common')}</h1>
            <div class="stats-grid">
              <!-- First stats block -->
              <ul class="stats-block" aria-label="General country statistics">
                <li><span class="stat-label">Native Name:</span> 
                  ${safeGet(countryData, 'altSpellings.1')}
                </li>
                <li><span class="stat-label">Population:</span> 
                   ${safeGet(countryData, 'population').toLocaleString()}
                </li>
                <li><span class="stat-label">Region:</span> 
                   ${safeGet(countryData, 'region')}
                </li>
                <li><span class="stat-label">Sub Region:</span> 
                  ${safeGet(countryData, 'subregion')}
                </li>
                <li><span class="stat-label">Capital:</span> 
                  ${safeGet(countryData, 'capital.0')}
                </li>
              </ul>

              <!-- Second stats block -->
              <ul class="stats-block" aria-label="Technical country details">
                <li><span class="stat-label">Top Level Domain:</span>
                  ${safeGet(countryData, 'tld.0')}
                </li>
                <li><span class="stat-label">Currencies:</span> 
                  ${getCurrency(countryData.currencies)}
                </li>
                <li><span class="stat-label">Languages:</span> 
                  ${getLanguages(countryData.languages)}
                </li>
              </ul>

              <!-- Third stats block -->
              <div class="stats-block stats-flex">
                <h2 id="borders-heading" class="stat-label">Border Countries:</h2>
                <ul aria-labelledby="borders-heading" class="stats-flex">${bordersHTML}</ul>
              </div>
            </div>
          </div>`;

  countryInfo.innerHTML = countryHTML;
  setTimeout(() => {
    countryInfo.querySelector('.info-text')?.classList.remove('fade-in');
  }, 400);
}

async function renderBorderCountries(country) {
  const borderCountryCCA = country.borders?.join(',') || '';

  if (!borderCountryCCA) {
    return '<li>None</li>';
  }

  const borderCountryNames = await getBorderCountryName(borderCountryCCA);
  return borderCountryNames
    .map((name) => {
      return /* html */ `
        <li><a href="details.html?name=${encodeURIComponent(name)}"
          class="border-country">${name}</a>
        </li>`;
    })
    .join('');
}

toggleThemeBtn.addEventListener('click', function () {
  const newTheme = getToggledTheme(rootEl);
  setButtonAttr({ theme: newTheme, button: this, buttonLabel, rootEl });
  setThemeIcon(newTheme, iconProps, rootEl);
  localStorage.setItem('theme', newTheme);
});

removeClassOnLoad(rootEl, 'no-theme-transition');
