import {
  getCurrency,
  getLanguages,
  getPreferredTheme,
  getToggledTheme,
  setButtonAttr,
  removeClassOnLoad,
  renderError,
} from './utils.js';
import { setThemeIcon } from './themeIcon.js';
import { getCountries, getBorderCountryName } from './countries.js';

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
    const name = new URLSearchParams(location.search).get('name');
    const country = await getCountries(name);
    if (!country) throw new Error('Country not found');
    await renderCountry(country[0]);
  } catch (error) {
    console.error(`Failed to fetch: ${error}`);
    renderError(error, statusMessage);
  }
}

async function renderCountry(countryData) {
  const bordersHTML = await renderBorderCountries(countryData);
  const countryHTML = /* html */ `
          <img class="country-flag" src="${countryData.flags.svg}" alt="${countryData.flags.alt}" />
            <div class="info-text">
              <h2 id="country-heading">${countryData.name.common}</h2>
              <div class="stats-flex">
                <!-- First stats block -->
                <ul class="stats-block">
                  <li><span class="stat-label">Native Name:</span> 
                    ${countryData.altSpellings[1]}
                  </li>
                  <li><span class="stat-label">Population:</span> ${countryData.population}</li>
                  <li><span class="stat-label">Region:</span> ${countryData.region}</li>
                  <li><span class="stat-label">Sub Region:</span> ${countryData.subregion}</li>
                  <li><span class="stat-label">Capital:</span> ${countryData.capital[0]}</li>
                </ul>

                <!-- Second stats block -->
                <ul class="stats-block">
                  <li><span class="stat-label">Top Level Domain:</span>
                    ${countryData.tld[0]}
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
                  <h3 class="stat-label">Border Countries:</h3>
                  <ul class="stats-flex">${bordersHTML}</ul>
                </div>
              </div>
            </div>
          </div>`;
  countryInfo.insertAdjacentHTML('beforeend', countryHTML);
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
