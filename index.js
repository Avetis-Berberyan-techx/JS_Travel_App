const API_URL = "https://restcountrie.com/v3.1/name/";
let searchedCountryData = {};
let liked = [];
let saved = [];

const countryInput = document.getElementById("country-input");
const likedTable = document.querySelector(".main__liked");
const savedTable = document.querySelector(".main__saved");
const tableNavigator = document.querySelector(".main__navigator");
//Buttons
const countrySearchBtn = document.getElementById("country-search-button");
const likedListBtn = document.getElementById("liked-list");
const savedListBtn = document.getElementById("saved-list");

const countryDisplay = document.querySelector(".main__display");

// --- Cookie Functions ---

const setCookie = (name, value, days = 10) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie =
    name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
};

const loadFromCookies = () => {
  const likedData = getCookie("likedCountries");
  const savedData = getCookie("savedCountries");

  liked = likedData ? JSON.parse(likedData) : [];
  saved = savedData ? JSON.parse(savedData) : [];

  // Render the loaded data
  renderCountries("liked", liked);
  renderCountries("saved", saved);
};

const saveToCookies = () => {
  setCookie("likedCountries", JSON.stringify(liked));
  setCookie("savedCountries", JSON.stringify(saved));
};

// --- Helper Functions ---

const createDisplayCard = (data) => {
  return `
  <div class="card">
    <div class="card__header">
      <h3 class="card__country-name">${data.name}</h3>
      <img src=${data.src} alt=${data.alt} class="card__flag" />
    </div>
    <div class="card__body">
      <p class="card__info"><strong>Capital:</strong> ${data.capital}</p>
      <p class="card__info"><strong>Population:</strong> ${data.population}</p>
      <p class="card__info"><strong>Region:</strong> ${data.region}</p>
      <p class="card__info"><strong>Currency:</strong> ${data.currency}</p>
      <p class="card__info"><strong>Languages:</strong> ${data.language}</p>
      <p class="card__info"><strong>Timezone:</strong> ${data.timezone}</p>
      <p class="card__info">
        <strong>Map:</strong>
        <a href=${data.mapLink} target="_blank" class="card__link">View on Google Maps</a>
      </p>
    </div>
    <div class="card__footer">
      <button class="card__button card__button--like" id="country-like">Like ❤️</button>
      <button class="card__button card__button--save" id="country-save">Save 💾</button>
    </div>
  </div>
  `;
};

const createRow = (country) => {
  return `
  <tr class="table__row">
    <td class="table__cell">${country.name}</td>
    <td class="table__cell"><img src=${country.src} alt=${country.alt} class="table__flag" /></td>
    <td class="table__cell">${country.capital}</td>
    <td class="table__cell">${country.population}</td>
    <td class="table__cell">${country.region}</td>
    <td class="table__cell">${country.currency}</td>
    <td class="table__cell">${country.language}</td>
    <td class="table__cell">${country.timezone}</td>
    <td class="table__cell">
      <a href=${country.mapLink} target="_blank" class="table__link">View</a>
    </td>
  </tr>
  `;
};

// Check if a country is already in the list
const countryIncludes = (country, countriesList) => {
  return countriesList.some((obj) => obj.name === country.name);
};

// Render liked or saved countries
const renderCountries = (whichList, countries) => {
  const table = document.querySelector(
    `.main__${whichList} .table .table__body`
  );
  if (!table) return; // safety check
  table.innerHTML = ""; // clear table before rendering
  countries.forEach((country) => {
    table.insertAdjacentHTML("beforeend", createRow(country));
  });
};

// Fetch country data from API
function fetchCountryData(countryName) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}${countryName}`)
      .then((response) => {
        if (!response.ok) {
          countryDisplay.innerHTML = `<h2>It is not a country</h2>`;
        }
        return response.json();
      })
      .then((data) => {
        data = data[0];
        let display = {
          name: data.name.common,
          src: data.flags.png,
          alt: data.flags.alt || data.name.common,
          capital: data.capital ? data.capital[0] : "N/A",
          population: data.population,
          region: data.continents[0],
          currency: data.currencies
            ? `${Object.keys(data.currencies)[0]}(${
                data.currencies[Object.keys(data.currencies)[0]].symbol
              })`
            : "N/A",
          language: data.languages ? Object.values(data.languages)[0] : "N/A",
          timezone: data.timezones[0],
          mapLink: data.maps.googleMaps,
        };
        searchedCountryData = display;
        resolve(display);
      })
      .catch((error) => reject(error));
  });
}

// --- Event Listeners ---

// Search button
countrySearchBtn.addEventListener("click", () => {
  if (countryInput.value.trim() === "") {
    countryDisplay.innerHTML = `<h2>Write country name</h2>`;
  } else {
    fetchCountryData(countryInput.value.trim())
      .then((data) => {
        countryDisplay.innerHTML = createDisplayCard(data);
      })
      .catch((err) => {
        console.log("failed to fetch");
      });
  }
});

countryDisplay.addEventListener("click", (e) => {
  //like button
  if (e.target.id === "country-like") {
    if (!countryIncludes(searchedCountryData, liked)) {
      liked.push(searchedCountryData);
      renderCountries("liked", liked);
      saveToCookies(); // Save to cookies
    }
  }
  //save button
  if (e.target.id === "country-save") {
    if (!countryIncludes(searchedCountryData, saved)) {
      saved.push(searchedCountryData);
      renderCountries("saved", saved);
      saveToCookies(); // Save to cookies
    }
  }
});

//show liked list
likedListBtn.addEventListener("click", () => {
  likedTable.style.display = "block";
  savedTable.style.display = "none";
});
//show saved list
savedListBtn.addEventListener("click", () => {
  savedTable.style.display = "block";
  likedTable.style.display = "none";
});

// Load data from cookies when the page loads
loadFromCookies();

// Initialize table display - show liked by default, hide saved
if (likedTable) likedTable.style.display = "block";
if (savedTable) savedTable.style.display = "none";
