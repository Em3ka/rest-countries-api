const API_URL = 'https://restcountries.com/v3.1/';

export async function getCountries(query) {
  const endpoint = typeof query === 'object' ? `all?fields=${query.fields}` : `name/${query}`;

  try {
    const res = await fetch(`${API_URL}${endpoint}`);

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Country not found.');
      }
      throw new Error(`HTTP error: ${res.status} ${res.statusText}`);
    }

    let countries;
    try {
      countries = await res.json();
    } catch {
      throw new Error('Failed to parse JSON response from the API.');
    }

    if (!Array.isArray(countries)) {
      throw new Error('Invalid data format received from API');
    }

    return countries.sort((a, b) => {
      const nameA = a.name?.common || '';
      const nameB = b.name?.common || '';
      return nameA.localeCompare(nameB);
    });
  } catch (error) {
    if (error instanceof TypeError || error.name === 'NetworkError') {
      throw new Error('Network error. Please check your internet connection.');
    }

    throw new Error(error.message || 'An unknown error occurred.');
  }
}

export async function getBorderCountryName(country) {
  const endpoint = `${API_URL}alpha?codes=${country}`;

  try {
    const res = await fetch(endpoint);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Country not found.');
      }
      throw new Error(`HTTP error: ${res.status} ${res.statusText}`);
    }

    let countries;
    try {
      countries = await res.json();
    } catch {
      throw new Error('Failed to parse JSON response from the API.');
    }

    if (!Array.isArray(countries)) {
      throw new Error('Invalid data format received from API');
    }

    return countries.map((c) => c.name.common);
  } catch (error) {
    throw new Error(error.message || 'Failed to get border country name');
  }
}
