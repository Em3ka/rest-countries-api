const API_URL = "https://restcountries.com/v3.1/";

export async function getCountries(query) {
  const endpoint =
    typeof query === "object" ? `all?fields=${query.fields}` : `name/${query}`;

  try {
    const res = await fetch(`${API_URL}${endpoint}`);

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Country not found. Please check your search term.");
      }
      throw new Error(`HTTP error: ${res.status} ${res.statusText}`);
    }

    let countries;
    try {
      countries = await res.json();
    } catch {
      throw new Error("Failed to parse JSON response from the API.");
    }

    if (!Array.isArray(countries)) {
      throw new Error("Invalid data format received from API");
    }

    return countries.sort((a, b) => {
      const nameA = a.name?.common || "";
      const nameB = b.name?.common || "";
      return nameA.localeCompare(nameB);
    });
  } catch (error) {
    // Handle network errors (e.g., no connection)
    if (
      error instanceof TypeError ||
      error.name === "NetworkError" ||
      !navigator.onLine
    ) {
      throw new Error("Network error. Please check your internet connection.");
    }

    // Re-throw other errors
    throw new Error(error.message || "An unknown error occurred.");
  }
}
