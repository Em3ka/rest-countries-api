const API_URL = 'https://restcountries.com/v3.1/';

export async function getCountries(query) {
  const endpoint =
    typeof query === 'object' ? `all?fields=${query.fields}` : `name/${query}`;

  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok) throw new Error(`Error fetching countries: ${res.status}`);
  const countries = await res.json();

  return countries.sort((a, b) => {
    return a.name.common.localeCompare(b.name.common);
  });
}
