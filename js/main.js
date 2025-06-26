import { getPreferredTheme, setButtonAttr, getToggledTheme } from './utils.js';
import { setThemeIcon } from './themeIcon.js';
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
let allCountriesArr = [];
let isLoading = false;
let currentIndex = 0;
const batchSize = 10;

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
  if (isLoading) return;
  isLoading = true;

  renderLoader(true);
  const countryFields = {
    fields: ['name', 'population', 'flags', 'region', 'capital'],
  };
  try {
    // Only fetch once
    if (allCountriesArr.length === 0) {
      const allCountries = await getCountries(countryFields);
      allCountriesArr = [...allCountries];
    }

    const end = Math.min(currentIndex + batchSize, allCountriesArr.length);
    const nextBatch = allCountriesArr.slice(currentIndex, end);

    // Defer UI update to allow a paint frame
    requestAnimationFrame(() => {
      renderBatch(nextBatch);
    });

    if (currentIndex === batchSize) {
      setupTopObserver();
    }

    currentIndex = end;

    // Stop observing if all countries have been shown
    if (currentIndex >= allCountriesArr.length) {
      observer.disconnect();
    }
  } catch (error) {
    renderError({
      title: 'Failed to load countries',
      body: error.message,
    });
  } finally {
    renderLoader(false);
    isLoading = false;
  }
}

function renderCountry(countryData) {
  const { name, population, flags, region, capital = [] } = countryData;

  const countryHTML = /* html */ `
      <li class="country-card">
        <img
          loading="lazy"
          src="${flags?.png}"
          alt="${flags?.alt}" />
        <div class="country-card__details">
          <a href="/details.html">
            <h3>${name?.common}</h3>
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

function renderBatch(countries) {
  countries.forEach((country) => renderCountry(country));
}

function filterCountries(filteredList) {
  countryGrid.innerHTML = '';
  filteredList.forEach((country) => renderCountry(country));
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

scrollToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        initializeCountries();
      }
    });
  },
  {
    rootMargin: '100px',
  }
);

observer.observe(loadMoreTrigger);

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
}

regionFilter.addEventListener('change', updateRegion);

window.addEventListener('load', () => rootEl.classList.remove('no-theme-transition'));
