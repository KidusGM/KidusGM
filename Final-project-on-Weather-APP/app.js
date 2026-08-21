const weather = id => document.getElementById(id);

const API = {
  geo: "https://geocoding-api.open-meteo.com/v1/search",
  weather: "https://api.open-meteo.com/v1/forecast"
};

const state = {
  cities: JSON.parse(localStorage.getItem("weatherCities") || "[]"),
  current: null,
  theme: localStorage.getItem("weatherTheme") || "light",
  weatherCities: []
};

let tempChart;
let rainChart;
let defaultCities = [];

const codes = {
  0: ["☀️", "Clear Sky", "clear"],
  1: ["🌤️", "Mainly Clear", "clear"],
  2: ["⛅", "Partly Cloudy", "clear"],
  3: ["☁️", "Cloudy", "cloudy"],
  45: ["🌫️", "Fog", "cloudy"],
  48: ["🌫️", "Rime Fog", "cloudy"],
  51: ["🌦️", "Light Drizzle", "rain"],
  53: ["🌦️", "Drizzle", "rain"],
  55: ["🌧️", "Heavy Drizzle", "rain"],
  61: ["🌧️", "Light Rain", "rain"],
  63: ["🌧️", "Rain", "rain"],
  65: ["🌧️", "Heavy Rain", "rain"],
  71: ["🌨️", "Light Snow", "rain"],
  73: ["🌨️", "Snow", "rain"],
  75: ["❄️", "Heavy Snow", "rain"],
  80: ["🌦️", "Rain Showers", "rain"],
  81: ["🌧️", "Rain Showers", "rain"],
  82: ["⛈️", "Heavy Showers", "rain"],
  95: ["⛈️", "Thunderstorm", "storm"],
  96: ["⛈️", "Thunderstorm + Hail", "storm"],
  99: ["⛈️", "Thunderstorm + Hail", "storm"]
};

/* =========================
   JAVASCRIPT STYLES
========================= */

const style = document.createElement("style");

style.textContent = `
  .view-weather-btn {
    margin-top: 12px;
    width: 100%;
    padding: 12px;
    border: 0;
    border-radius: 10px;
    background: var(--green, #198754);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: .2s ease;
  }

  .view-weather-btn:hover {
    opacity: .85;
    transform: translateY(-1px);
  }

  .view-weather-btn:active {
    transform: translateY(0);
  }

  .city-filter {
    display: flex;
    gap: 12px;
    margin: 20px 0;
  }

  .city-filter input,
  .city-filter select {
    padding: 12px 14px;
    border: 1px solid #ddd;
    border-radius: 10px;
    font: inherit;
    outline: none;
  }

  .city-filter input {
    flex: 1;
  }

  .city-filter select {
    min-width: 170px;
    background: #fff;
    cursor: pointer;
  }

  .city-filter input:focus,
  .city-filter select:focus {
    border-color: var(--green, #198754);
  }

  @media (max-width: 600px) {
    .city-filter {
      flex-direction: column;
    }

    .city-filter select {
      width: 100%;
    }
  }
`;

document.head.appendChild(style);

/* =========================
   HELPERS
========================= */

async function getData(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Request failed");
  }

  return response.json();
}

function cityData(city) {
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    admin1: city.admin1 || "",
    latitude: city.latitude,
    longitude: city.longitude
  };
}

function saveCities() {
  localStorage.setItem(
    "weatherCities",
    JSON.stringify(state.cities)
  );
}

function saveTheme() {
  localStorage.setItem(
    "weatherTheme",
    state.theme
  );
}

function showMessage(text) {
  weather("message").textContent = text;
}

function showAddMessage(text) {
  weather("addMessage").textContent = text;
}

function formatTime(time) {
  return new Date(time).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

/* =========================
   LOAD CITIES.JSON
========================= */

async function loadCityList() {
  try {
    const data = await getData("cities.json");

    /*
      Supports:

      [
        "Addis Ababa",
        "Bahir Dar"
      ]

      OR:

      [
        { "name": "Addis Ababa" },
        { "name": "Bahir Dar" }
      ]
    */

    defaultCities = data
      .map(city =>
        typeof city === "string"
          ? city
          : city.name
      )
      .filter(Boolean);

    await loadAllCities();

  } catch (error) {
    console.error("Could not load cities.json:", error);

    weather("cityGrid").innerHTML = `
      <div class="city-card">
        <h3>⚠️ Could not load cities</h3>
        <p>Make sure cities.json is in the same folder as app.js.</p>
      </div>
    `;
  }
}

/* =========================
   SEARCH CITY
========================= */

async function findCity(name, addMode = false) {
  name = name.trim();

  if (!name) {
    return addMode
      ? showAddMessage("Please enter a city name.")
      : showMessage("Please enter a city name.");
  }

  addMode
    ? showAddMessage("🔎 Searching...")
    : showMessage("🔎 Searching...");

  try {
    const data = await getData(
      `${API.geo}?name=${encodeURIComponent(name)}&count=5&language=en&format=json`
    );

    if (!data.results?.length) {
      addMode
        ? showAddMessage("❌ City not found. Try another name.")
        : showMessage("❌ City not found. Try another name.");

      if (addMode) {
        weather("searchResults").innerHTML = "";
      }

      return;
    }

    if (addMode) {
      renderSearchResults(data.results);
      showAddMessage("");
    } else {
      const city = cityData(data.results[0]);

      showMessage(`🌦️ Loading ${city.name}...`);

      await loadWeather(city);
    }

  } catch {
    addMode
      ? showAddMessage(
          "⚠️ Could not connect to the location service."
        )
      : showMessage(
          "⚠️ Could not connect to the location service."
        );
  }
}

/* =========================
   SEARCH RESULTS
========================= */

function renderSearchResults(results) {
  weather("searchResults").innerHTML =
    results.map(city => `
      <div class="search-result">

        <div>
          <strong>${city.name}</strong>

          <p>
            ${city.admin1 || ""}
            ${city.admin1 ? ", " : ""}
            ${city.country}
          </p>
        </div>

        <button
          class="result-add"
          onclick='addNewCity(${JSON.stringify(city)})'>
          ➕ Add
        </button>

      </div>
    `).join("");
}

/* =========================
   ADD CITY
========================= */

async function addNewCity(city) {
  if (
    state.cities.some(
      item => item.id === city.id
    )
  ) {
    showAddMessage("⭐ This city is already saved.");
    return;
  }

  const newCity = cityData(city);

  state.cities.push(newCity);

  saveCities();
  renderSaved();

  showAddMessage(`✅ ${city.name} added!`);

  await loadAllCities();
  await loadWeather(newCity);
}

/* =========================
   LOAD WEATHER DETAILS
========================= */

async function loadWeather(city) {
  showMessage("🌦️ Loading weather...");

  const url =
    `${API.weather}?latitude=${city.latitude}` +
    `&longitude=${city.longitude}` +

    `&current=` +
    `temperature_2m,` +
    `relative_humidity_2m,` +
    `apparent_temperature,` +
    `weather_code,` +
    `wind_speed_10m,` +
    `wind_direction_10m,` +
    `surface_pressure` +

    `&hourly=` +
    `temperature_2m,` +
    `weather_code,` +
    `precipitation_probability,` +
    `visibility,` +
    `dew_point_2m` +

    `&daily=` +
    `weather_code,` +
    `temperature_2m_max,` +
    `temperature_2m_min,` +
    `precipitation_probability_max,` +
    `sunrise,` +
    `sunset,` +
    `uv_index_max` +

    `&timezone=auto`;

  try {
    const data = await getData(url);

    state.current = {
      city,
      data
    };

    showDetails(city, data);

  } catch {
    showMessage("⚠️ Could not load weather.");
  }
}

/* =========================
   LOAD ALL CITIES
========================= */

async function loadAllCities() {
  weather("cityGrid").innerHTML = `
    <div class="city-card">
      Loading cities...
    </div>
  `;

  const names = [...defaultCities];

  state.cities.forEach(city => {
    if (
      !names.some(
        name =>
          name.toLowerCase() ===
          city.name.toLowerCase()
      )
    ) {
      names.push(city.name);
    }
  });

  const results = [];

  for (const name of names) {
    try {
      let city = state.cities.find(
        item =>
          item.name.toLowerCase() ===
          name.toLowerCase()
      );

      if (!city) {
        const data = await getData(
          `${API.geo}?name=${encodeURIComponent(name)}&count=1&language=en&format=json`
        );

        if (!data.results?.length) {
          continue;
        }

        city = cityData(data.results[0]);
      }

      const url =
        `${API.weather}?latitude=${city.latitude}` +
        `&longitude=${city.longitude}` +

        `&current=` +
        `temperature_2m,` +
        `relative_humidity_2m,` +
        `apparent_temperature,` +
        `weather_code,` +
        `wind_speed_10m` +

        `&daily=` +
        `temperature_2m_max,` +
        `temperature_2m_min` +

        `&timezone=auto`;

      const weatherData = await getData(url);

      results.push({
        city,
        weather: weatherData
      });

    } catch {
      console.log(`Could not load ${name}`);
    }
  }

  state.weatherCities = results;

  renderCities(results);
}

/* =========================
   CITY FILTER
========================= */

function filterCities() {
  const citySearch =
    weather("cityFilter")
      .value
      .trim()
      .toLowerCase();

  const weatherType =
    weather("weatherFilter").value;

  const filtered =
    state.weatherCities.filter(item => {

      const city = item.city;
      const current = item.weather.current;

      const searchableText = `
        ${city.name}
        ${city.admin1 || ""}
        ${city.country || ""}
      `.toLowerCase();

      const matchesCity =
        searchableText.includes(citySearch);

      const weatherInfo =
        codes[current.weather_code] ||
        ["🌤️", "Unknown", "cloudy"];

      const type = weatherInfo[2];

      const matchesWeather =
        weatherType === "all" ||
        type === weatherType;

      return matchesCity && matchesWeather;
    });

  renderCities(filtered, true);
}

/* =========================
   CITY CARDS
========================= */

function renderCities(results, filtered = false) {
  weather("cityCount").textContent =
    filtered
      ? `${results.length} cities found`
      : `${results.length} cities`;

  if (!results.length) {
    weather("cityGrid").innerHTML = `
      <div class="city-card">
        <h3>🔎 No cities found</h3>
        <p>Try another city or weather condition.</p>
      </div>
    `;

    return;
  }

  weather("cityGrid").innerHTML =
    results.map(({ city, weather: data }) => {

      const current = data.current;

      const code =
        codes[current.weather_code] ||
        ["🌤️", "Unknown", "cloudy"];

      const saved =
        state.cities.some(
          item => item.id === city.id
        );

      return `
        <article class="city-card">

          <button
            class="star"
            onclick='toggleSave(${JSON.stringify(city)})'>
            ${saved ? "★" : "☆"}
          </button>

          <h3>${city.name}</h3>

          <p class="region">
            ${city.admin1 || city.country}
          </p>

          <div class="weather-icon">
            ${code[0]}
          </div>

          <div class="city-temp">
            ${Math.round(current.temperature_2m)}°
          </div>

          <p class="condition">
            ${code[1]}
          </p>

          <div class="city-details">

            <span>
              Feels like
              <strong>
                ${Math.round(current.apparent_temperature)}°C
              </strong>
            </span>

            <span>
              Humidity
              <strong>
                ${current.relative_humidity_2m}%
              </strong>
            </span>

            <span>
              Wind
              <strong>
                ${Math.round(current.wind_speed_10m)} km/h
              </strong>
            </span>

          </div>

          <p class="updated">
            Updated
            ${new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>

          <button
            class="view-weather-btn"
            onclick='loadWeather(${JSON.stringify(city)})'>
            View Weather
          </button>

        </article>
      `;
    }).join("");
}

/* =========================
   WEATHER DETAILS
========================= */

function showDetails(city, data) {
  const current = data.current;
  const daily = data.daily;

  const code =
    codes[current.weather_code] ||
    ["🌤️", "Unknown", "cloudy"];

  weather("detailCity").textContent =
    city.name;

  weather("detailLocation").textContent =
    `${city.admin1 || city.country}, ${city.country}`;

  weather("detailIcon").textContent =
    code[0];

  weather("detailCondition").textContent =
    code[1];

  weather("detailTemp").textContent =
    Math.round(current.temperature_2m);

  weather("detailFeels").textContent =
    Math.round(current.apparent_temperature) + "°";

  weather("detailHigh").textContent =
    Math.round(daily.temperature_2m_max[0]) + "°";

  weather("detailLow").textContent =
    Math.round(daily.temperature_2m_min[0]) + "°";

  weather("detailHumidity").textContent =
    current.relative_humidity_2m + "%";

  weather("detailWind").textContent =
    Math.round(current.wind_speed_10m) + " km/h";

  weather("pressure").textContent =
    Math.round(current.surface_pressure) + " hPa";

  weather("uv").textContent =
    daily.uv_index_max[0];

  weather("sunrise").textContent =
    formatTime(daily.sunrise[0]);

  weather("sunset").textContent =
    formatTime(daily.sunset[0]);

  weather("localTime").textContent =
    new Date().toLocaleTimeString();

  /*
    Open-Meteo provides visibility and
    dew point through hourly data.

    The first hourly value represents
    the current hour.
  */

  const visibility =
    data.hourly.visibility?.[0];

  const dewPoint =
    data.hourly.dew_point_2m?.[0];

  if (
    visibility !== undefined &&
    visibility !== null
  ) {
    weather("visibility").textContent =
      visibility >= 1000
        ? `${(visibility / 1000).toFixed(1)} km`
        : `${Math.round(visibility)} m`;
  } else {
    weather("visibility").textContent = "--";
  }

  if (
    dewPoint !== undefined &&
    dewPoint !== null
  ) {
    weather("dewPoint").textContent =
      `${Math.round(dewPoint)}°C`;
  } else {
    weather("dewPoint").textContent = "--";
  }

  renderHourly(data);
  renderDaily(data);
  renderCharts(data);
  updateSaveButton(city);

  weather("detailsSection")
    .classList
    .remove("hidden");

  weather("detailsSection")
    .scrollIntoView({
      behavior: "smooth"
    });

  showMessage("");
}

/* =========================
   HOURLY
========================= */

function renderHourly(data) {
  weather("hourly").innerHTML =
    data.hourly.time
      .slice(0, 13)
      .map((time, i) => {

        const code =
          codes[data.hourly.weather_code[i]] ||
          ["🌤️"];

        const hour =
          i === 0
            ? "Now"
            : new Date(time).toLocaleTimeString([], {
                hour: "numeric"
              });

        return `
          <div class="hour-card">

            <strong>${hour}</strong>

            <span>${code[0]}</span>

            <strong>
              ${Math.round(
                data.hourly.temperature_2m[i]
              )}°
            </strong>

            <p>
              💧 ${data.hourly.precipitation_probability[i]}%
            </p>

          </div>
        `;
      })
      .join("");
}

/* =========================
   DAILY
========================= */

function renderDaily(data) {
  weather("daily").innerHTML =
    data.daily.time
      .map((date, i) => {

        const code =
          codes[data.daily.weather_code[i]] ||
          ["🌤️", "Unknown"];

        const day =
          i === 0
            ? "Today"
            : new Date(date).toLocaleDateString(
                "en",
                {
                  weekday: "short"
                }
              );

        return `
          <div class="day-card">

            <strong>${day}</strong>

            <span>${code[0]}</span>

            <strong>
              ${Math.round(
                data.daily.temperature_2m_max[i]
              )}°
            </strong>

            <p>${code[1]}</p>

            <p>
              💧 ${data.daily.precipitation_probability_max[i]}%
            </p>

            <small>
              ${Math.round(
                data.daily.temperature_2m_min[i]
              )}°
              /
              ${Math.round(
                data.daily.temperature_2m_max[i]
              )}°
            </small>

          </div>
        `;
      })
      .join("");
}

/* =========================
   CHARTS
========================= */

function renderCharts(data) {
  if (tempChart) {
    tempChart.destroy();
  }

  if (rainChart) {
    rainChart.destroy();
  }

  const labels =
    data.hourly.time
      .slice(0, 12)
      .map(time =>
        new Date(time).toLocaleTimeString([], {
          hour: "numeric"
        })
      );

  const temperatures =
    data.hourly.temperature_2m.slice(0, 12);

  const rain =
    data.hourly.precipitation_probability
      .slice(0, 12);

  tempChart = new Chart(
    weather("temperatureChart"),
    {
      type: "line",

      data: {
        labels,

        datasets: [{
          label: "Temperature °C",
          data: temperatures,
          tension: 0.4,
          fill: false
        }]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    }
  );

  rainChart = new Chart(
    weather("rainChart"),
    {
      type: "line",

      data: {
        labels,

        datasets: [{
          label: "Rain Probability %",
          data: rain,
          tension: 0.4,
          fill: true
        }]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    }
  );
}

/* =========================
   SAVE / REMOVE
========================= */

function toggleSave(city) {
  const exists =
    state.cities.some(
      item => item.id === city.id
    );

  if (exists) {
    state.cities =
      state.cities.filter(
        item => item.id !== city.id
      );

    showMessage(`${city.name} removed.`);

  } else {
    state.cities.push(
      cityData(city)
    );

    showMessage(`${city.name} saved!`);
  }

  saveCities();
  renderSaved();
  loadAllCities();
  updateSaveButton(city);
}

function removeCity(id) {
  state.cities =
    state.cities.filter(
      city => city.id !== id
    );

  saveCities();
  renderSaved();
  loadAllCities();
}

/* =========================
   SAVED CITIES
========================= */

function renderSaved() {
  weather("savedCount").textContent =
    `${state.cities.length} saved`;

  weather("savedCities").innerHTML =
    state.cities
      .map(city => `
        <div class="saved-city">

          <div class="saved-left">

            <div class="saved-icon">
              🌦️
            </div>

            <div>
              <h3>${city.name}</h3>

              <p>
                ${city.admin1 || city.country}
              </p>
            </div>

          </div>

          <div class="saved-buttons">

            <button
              onclick='loadWeather(${JSON.stringify(city)})'>
              View
            </button>

            <button
              class="delete-btn"
              onclick="removeCity(${city.id})">
              🗑️
            </button>

          </div>

        </div>
      `)
      .join("");
}

/* =========================
   NOTIFICATIONS
========================= */

async function enableNotifications() {
  if (!("Notification" in window)) {
    showMessage(
      "Your browser does not support notifications."
    );

    return;
  }

  const permission =
    await Notification.requestPermission();

  if (permission === "granted") {

    new Notification("🌦️ Bole Weather", {
      body:
        "Weather notifications are now enabled!"
    });

    showMessage(
      "🔔 Notifications enabled."
    );

  } else {

    showMessage(
      "Notification permission was denied."
    );
  }
}

/* =========================
   DARK MODE
========================= */

function applyTheme() {
  document.body.classList.toggle(
    "dark",
    state.theme === "dark"
  );

  weather("themeBtn").textContent =
    state.theme === "dark"
      ? "☀️"
      : "🌙";
}

function toggleTheme() {
  state.theme =
    state.theme === "light"
      ? "dark"
      : "light";

  saveTheme();
  applyTheme();
}

/* =========================
   ADD CITY PANEL
========================= */

function openAddCity() {
  weather("addCityPanel")
    .classList
    .remove("hidden");

  weather("newCityInput").focus();

  weather("addCityPanel")
    .scrollIntoView({
      behavior: "smooth"
    });
}

function closeAddCity() {
  weather("addCityPanel")
    .classList
    .add("hidden");

  weather("searchResults").innerHTML = "";

  weather("newCityInput").value = "";
}

/* =========================
   SAVE BUTTON
========================= */

function updateSaveButton(city) {
  const saved =
    state.cities.some(
      item => item.id === city.id
    );

  weather("saveBtn").textContent =
    saved
      ? "★ Saved"
      : "☆ Save City";
}

/* =========================
   EVENTS
========================= */

weather("saveBtn")
  .addEventListener("click", () => {

    if (state.current) {
      toggleSave(
        state.current.city
      );
    }

  });

weather("searchForm")
  .addEventListener("submit", e => {

    e.preventDefault();

    findCity(
      weather("cityInput").value
    );

  });

weather("addCityBtn")
  .addEventListener(
    "click",
    openAddCity
  );

weather("closeAddBtn")
  .addEventListener(
    "click",
    closeAddCity
  );

weather("findCityBtn")
  .addEventListener(
    "click",
    () =>
      findCity(
        weather("newCityInput").value,
        true
      )
  );

weather("newCityInput")
  .addEventListener(
    "keydown",
    e => {

      if (e.key === "Enter") {

        e.preventDefault();

        findCity(
          weather("newCityInput").value,
          true
        );
      }

    }
  );

weather("notifyBtn")
  .addEventListener(
    "click",
    enableNotifications
  );

weather("themeBtn")
  .addEventListener(
    "click",
    toggleTheme
  );

weather("backBtn")
  .addEventListener(
    "click",
    () => {

      weather("detailsSection")
        .classList
        .add("hidden");

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );

/* =========================
   FILTER EVENTS
========================= */

weather("cityFilter")
  .addEventListener(
    "input",
    filterCities
  );

weather("weatherFilter")
  .addEventListener(
    "change",
    filterCities
  );

/* =========================
   START APP
========================= */

applyTheme();
renderSaved();
loadCityList();