import {
  getPreferredTheme,
  setButtonAttr,
  getToggledTheme,
  renderError,
  removeClassOnLoad,
  clearError,
  safeGet,
  getRootStyle,
} from './utils.js';
import setThemeIcon from './themeIcon.js';
import { getCountries } from './countries.js';

const topTrigger = document.querySelector('.top-trigger');
const scrollToTopBtn = document.querySelector('.scroll-to-top');
const loadMoreTrigger = document.getElementById('loadMoreTrigger');
const buttonLabel = document.getElementById('themeToggleLabel');
const toggleThemeBtn = document.getElementById('themeToggle');
const bouncingLoader = document.querySelector('.bouncing-loader');
const countryGrid = document.querySelector('.country-grid');
const statusMessage = document.querySelector('.status-message');
const countrySearch = document.getElementById('countrySearch');
const regionFilter = document.getElementById('region');
const core = document.querySelector('.core');
const sunRay = document.querySelectorAll('.sun-ray');
const moonRay = document.querySelector('.moon-ray');

const rootEl = document.documentElement;
const iconProps = { core, sunRay, moonRay, rootEl };
const obsOption = { rootMargin: '100px' };
let allCountriesArr = [];
let isLoading = false;
let currentIndex = 0;
const batchSize = 12;
const topObserver = setupTopObserver();

init();

function init() {
  setupTheme();
  loadMoreCountries();
}

function setupTheme() {
  const theme = getPreferredTheme();
  setButtonAttr({ theme, button: toggleThemeBtn, buttonLabel, rootEl });
  setThemeIcon(theme, iconProps, true);
  updateSelectCaret();
}

function updateSelectCaret() {
  const arrowColor = getRootStyle(rootEl, '--text-main');
  console.log(arrowColor);
  const svg = /* html */ `
    <svg width='14' height='10' viewBox='0 0 14 10' xmlns='http://www.w3.org/2000/svg'>
      <path d='M1 1l6 7 6-7' stroke='${arrowColor}' stroke-width='2' fill='none'/>
    </svg>`;

  const encoded = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  regionFilter.style.backgroundImage = `url("${encoded}")`;
}

function renderLoader(state) {
  return state
    ? bouncingLoader.removeAttribute('hidden')
    : bouncingLoader.setAttribute('hidden', '');
}

async function loadMoreCountries() {
  if (isLoading) return;
  isLoading = true;

  renderLoader(true);
  const countryFields = {
    fields: ['name', 'population', 'flags', 'capital', 'region'],
  };
  try {
    if (allCountriesArr.length === 0) {
      const allCountries = await getCountries(countryFields);
      allCountriesArr = [...allCountries];
    }

    const end = Math.min(currentIndex + batchSize, allCountriesArr.length);
    const nextBatch = allCountriesArr.slice(currentIndex, end);

    requestAnimationFrame(() => {
      renderBatch(nextBatch);
    });

    // Clear error if we actually have something to render
    if (nextBatch.length > 1) {
      clearError(statusMessage);
    }

    currentIndex = end;

    // Setup "scroll to top" once first batch is shown
    if (currentIndex === batchSize) {
      setupTopObserver();
    }

    // Stop observing if all countries have been shown
    if (currentIndex >= allCountriesArr.length) {
      topObserver.disconnect();
    }
  } catch (error) {
    console.error(error);
    renderError({ title: 'Failed to load countries', body: error.message }, statusMessage);
  } finally {
    renderLoader(false);
    isLoading = false;
  }
}

function renderCountry(countryData) {
  if (!countryData) return;
  const name = safeGet(countryData, 'name.common');

  const countryHTML = /* html */ `
      <li class="country-card">
        <div class="country-flag-wrapper">
          <img
            src="${safeGet(countryData, 'flags.png', 'Country flag not available')}"
            alt="${safeGet(countryData, 'flags.alt', 'Country flag alt not available')}" />
        </div>
        <div class="country-card__details">
          <a href="/details.html?name=${encodeURIComponent(name)}">
            <h2>${name}</h2>
          </a>
          <p><span class="stat-label">Population:</span>
             ${safeGet(countryData, 'population').toLocaleString()}
          </p>
          <p><span class="stat-label">Region:</span>
           ${safeGet(countryData, 'region')}
          </p>
          <p><span class="stat-label">Capital:</span>
             ${safeGet(countryData, 'capital.0')}
          </p>
        </div>
       </li>`;

  countryGrid.insertAdjacentHTML('beforeend', countryHTML);
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

function renderBatch(countries) {
  countries.forEach((country) => renderCountry(country));
}

function filterCountries(filteredList) {
  clearCountryList();
  filteredList.forEach((country) => renderCountry(country));
}

toggleThemeBtn.addEventListener('click', function () {
  const newTheme = getToggledTheme(rootEl);
  setButtonAttr({ theme: newTheme, button: this, buttonLabel, rootEl });
  setThemeIcon(newTheme, iconProps, rootEl);
  updateSelectCaret();
  localStorage.setItem('theme', newTheme);
});

scrollToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const countryObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      loadMoreCountries();
    }
  });
}, obsOption);

countryObserver.observe(loadMoreTrigger);

function setupTopObserver() {
  if (!topTrigger) return;
  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (!entry.isIntersecting) {
      scrollToTopBtn.classList.add('show');
    } else {
      scrollToTopBtn.classList.remove('show');
    }
  });

  observer.observe(topTrigger);
  return observer;
}

regionFilter.addEventListener('change', updateRegion);

countrySearch.addEventListener('input', (e) => {
  const name = e.target.value.trim().toLowerCase();
  clearError(statusMessage);
  countryObserver.disconnect(); // Pause loading more countries
  clearCountryList();

  if (!name) {
    currentIndex = 0;
    loadMoreCountries(); // Load initial batch again
    countryObserver.observe(loadMoreTrigger);
    return;
  }

  const matchingCountries = allCountriesArr.filter((c) =>
    c.name?.common?.toLowerCase().includes(name)
  );

  if (matchingCountries.length > 0) {
    renderBatch(matchingCountries);
  } else {
    renderError('No matches found', statusMessage);
  }
});

function clearCountryList() {
  if (countryGrid) countryGrid.innerHTML = '';
}

removeClassOnLoad(rootEl, 'no-theme-transition');
