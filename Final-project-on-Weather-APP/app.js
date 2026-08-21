const $ = id => document.getElementById(id);

const API = {
  geo: "https://geocoding-api.open-meteo.com/v1/search",
  weather: "https://api.open-meteo.com/v1/forecast"
};

const defaultCities = [
  "Addis Ababa",
  "Bahir Dar",
  "Gondar",
  "Dire Dawa",
  "Hawassa",
  "Mekelle",
  "Jimma",
  "Adama"
];

const state = {
  cities: JSON.parse(localStorage.getItem("weatherCities") || "[]"),
  current: null,
  theme: localStorage.getItem("weatherTheme") || "light"
};

let tempChart;
let rainChart;

const codes = {
  0: ["☀️", "Clear Sky"],
  1: ["🌤️", "Mainly Clear"],
  2: ["⛅", "Partly Cloudy"],
  3: ["☁️", "Cloudy"],
  45: ["🌫️", "Fog"],
  48: ["🌫️", "Rime Fog"],
  51: ["🌦️", "Light Drizzle"],
  53: ["🌦️", "Drizzle"],
  55: ["🌧️", "Heavy Drizzle"],
  61: ["🌧️", "Light Rain"],
  63: ["🌧️", "Rain"],
  65: ["🌧️", "Heavy Rain"],
  71: ["🌨️", "Light Snow"],
  73: ["🌨️", "Snow"],
  75: ["❄️", "Heavy Snow"],
  80: ["🌦️", "Rain Showers"],
  81: ["🌧️", "Rain Showers"],
  82: ["⛈️", "Heavy Showers"],
  95: ["⛈️", "Thunderstorm"],
  96: ["⛈️", "Thunderstorm + Hail"],
  99: ["⛈️", "Thunderstorm + Hail"]
};


/* =========================
   LOCAL STORAGE
========================= */

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


/* =========================
   SEARCH CITY
========================= */

async function findCity(name) {

  name = name.trim();

  if (!name) {
    showAddMessage("Please enter a city name.");
    return;
  }

  showAddMessage("🔎 Searching...");

  try {

    const response = await fetch(
      `${API.geo}?name=${encodeURIComponent(name)}&count=5&language=en&format=json`
    );

    const data = await response.json();

    if (!data.results?.length) {
      showAddMessage("❌ City not found. Try another name.");
      $("searchResults").innerHTML = "";
      return;
    }

    renderSearchResults(data.results);

    showAddMessage("");

  } catch {
    showAddMessage(
      "⚠️ Could not connect to the location service."
    );
  }
}


/* =========================
   SEARCH RESULTS
========================= */

function renderSearchResults(results) {

  $("searchResults").innerHTML = results.map(city => `

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

  const exists = state.cities.some(
    item => item.id === city.id
  );

  if (exists) {
    showAddMessage("⭐ This city is already saved.");
    return;
  }

  const newCity = {
    id: city.id,
    name: city.name,
    country: city.country,
    admin1: city.admin1 || "",
    latitude: city.latitude,
    longitude: city.longitude
  };

  state.cities.push(newCity);

  saveCities();

  renderSaved();

  showAddMessage(
    `✅ ${city.name} added!`
  );

  /*
    IMPORTANT:
    Reload the main city grid so the
    new city appears with the others.
  */
  await loadAllCities();

  await loadWeather(newCity);
}


/* =========================
   LOAD WEATHER
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
    `precipitation_probability` +

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

    const response = await fetch(url);
    const data = await response.json();

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

  $("cityGrid").innerHTML = `
    <div class="city-card">
      Loading cities...
    </div>
  `;

  /*
    Start with the original 8 cities.
  */
  const names = [...defaultCities];

  /*
    Add cities from Local Storage.
  */
  state.cities.forEach(city => {

    const alreadyExists = names.some(
      name =>
        name.toLowerCase() === city.name.toLowerCase()
    );

    if (!alreadyExists) {
      names.push(city.name);
    }

  });


  const results = [];

  /*
    Get coordinates for every city.
  */
  for (const name of names) {

    try {

      /*
        If this city is already saved,
        use its stored coordinates.
      */
      let city = state.cities.find(
        item =>
          item.name.toLowerCase() === name.toLowerCase()
      );


      /*
        Otherwise find the coordinates
        automatically.
      */
      if (!city) {

        const response = await fetch(
          `${API.geo}?name=${encodeURIComponent(name)}&count=1&language=en&format=json`
        );

        const data = await response.json();

        if (!data.results?.length) {
          continue;
        }

        city = data.results[0];
      }


      const weatherResponse = await fetch(

        `${API.weather}` +

        `?latitude=${city.latitude}` +
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

        `&timezone=auto`

      );


      const weather =
        await weatherResponse.json();


      results.push({
        city,
        weather
      });


    } catch {

      console.log(
        `Could not load ${name}`
      );

    }
  }


  renderCities(results);
}


/* =========================
   CITY CARDS
========================= */

function renderCities(results) {

  $("cityCount").textContent =
    `${results.length} cities`;


  $("cityGrid").innerHTML =
    results.map(({ city, weather }) => {

      const current = weather.current;

      const code =
        codes[current.weather_code] ||
        ["🌤️", "Unknown"];


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


          <h3>
            ${city.name}
          </h3>


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
                ${Math.round(
                  current.apparent_temperature
                )}°C
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
                ${Math.round(
                  current.wind_speed_10m
                )} km/h
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
            onclick='loadWeather(${JSON.stringify(city)})'
            style="
              margin-top:12px;
              width:100%;
              padding:10px;
              border:0;
              border-radius:8px;
              background:var(--green);
              color:white;
            ">

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
    ["🌤️", "Unknown"];


  $("detailCity").textContent =
    city.name;


  $("detailLocation").textContent =
    `${city.admin1 || city.country}, ${city.country}`;


  $("detailIcon").textContent =
    code[0];


  $("detailCondition").textContent =
    code[1];


  $("detailTemp").textContent =
    Math.round(current.temperature_2m);


  $("detailFeels").textContent =
    Math.round(
      current.apparent_temperature
    ) + "°";


  $("detailHigh").textContent =
    Math.round(
      daily.temperature_2m_max[0]
    ) + "°";


  $("detailLow").textContent =
    Math.round(
      daily.temperature_2m_min[0]
    ) + "°";


  $("detailHumidity").textContent =
    current.relative_humidity_2m + "%";


  $("detailWind").textContent =
    Math.round(
      current.wind_speed_10m
    ) + " km/h";


  $("pressure").textContent =
    Math.round(
      current.surface_pressure
    ) + " hPa";


  $("uv").textContent =
    daily.uv_index_max[0];


  $("sunrise").textContent =
    formatTime(daily.sunrise[0]);


  $("sunset").textContent =
    formatTime(daily.sunset[0]);


  $("localTime").textContent =
    new Date().toLocaleTimeString();


  $("visibility").textContent =
    "--";


  $("dewPoint").textContent =
    "--";


  renderHourly(data);

  renderDaily(data);

  renderCharts(data);

  updateSaveButton(city);


  $("detailsSection")
    .classList
    .remove("hidden");


  $("detailsSection")
    .scrollIntoView({
      behavior: "smooth"
    });


  showMessage("");
}


/* =========================
   HOURLY
========================= */

function renderHourly(data) {

  $("hourly").innerHTML =
    data.hourly.time
      .slice(0, 13)
      .map((time, i) => {

        const code =
          codes[
            data.hourly.weather_code[i]
          ] || ["🌤️"];


        const hour =
          i === 0
            ? "Now"
            : new Date(time)
                .toLocaleTimeString(
                  [],
                  {
                    hour: "numeric"
                  }
                );


        return `

          <div class="hour-card">

            <strong>
              ${hour}
            </strong>

            <span>
              ${code[0]}
            </span>

            <strong>
              ${Math.round(
                data.hourly.temperature_2m[i]
              )}°
            </strong>

            <p>
              💧
              ${data.hourly.precipitation_probability[i]}%
            </p>

          </div>

        `;

      }).join("");
}


/* =========================
   DAILY
========================= */

function renderDaily(data) {

  $("daily").innerHTML =
    data.daily.time.map((date, i) => {

      const code =
        codes[
          data.daily.weather_code[i]
        ] || ["🌤️", "Unknown"];


      const day =
        i === 0
          ? "Today"
          : new Date(date)
              .toLocaleDateString(
                "en",
                {
                  weekday: "short"
                }
              );


      return `

        <div class="day-card">

          <strong>
            ${day}
          </strong>

          <span>
            ${code[0]}
          </span>

          <strong>
            ${Math.round(
              data.daily.temperature_2m_max[i]
            )}°
          </strong>

          <p>
            ${code[1]}
          </p>

          <p>
            💧
            ${data.daily.precipitation_probability_max[i]}%
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

    }).join("");
}


/* =========================
   CHARTS
========================= */

function renderCharts(data) {

  if (tempChart)
    tempChart.destroy();

  if (rainChart)
    rainChart.destroy();


  const labels =
    data.hourly.time
      .slice(0, 12)
      .map(time =>
        new Date(time)
          .toLocaleTimeString(
            [],
            {
              hour: "numeric"
            }
          )
      );


  const temperatures =
    data.hourly.temperature_2m
      .slice(0, 12);


  const rain =
    data.hourly.precipitation_probability
      .slice(0, 12);


  tempChart =
    new Chart(
      $("temperatureChart"),
      {
        type: "line",

        data: {
          labels,

          datasets: [{
            label: "Temperature °C",
            data: temperatures,
            tension: .4,
            fill: false
          }]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      }
    );


  rainChart =
    new Chart(
      $("rainChart"),
      {
        type: "line",

        data: {
          labels,

          datasets: [{
            label: "Rain Probability %",
            data: rain,
            tension: .4,
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

    showMessage(
      `${city.name} removed.`
    );

  } else {

    state.cities.push({
      id: city.id,
      name: city.name,
      country: city.country,
      admin1: city.admin1 || "",
      latitude: city.latitude,
      longitude: city.longitude
    });

    showMessage(
      `${city.name} saved!`
    );
  }


  saveCities();

  renderSaved();

  /*
    Rebuild the main city grid.
    This is what makes the added city
    appear together with the others.
  */
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

  $("savedCount").textContent =
    `${state.cities.length} saved`;


  $("savedCities").innerHTML =
    state.cities.map(city => `

      <div class="saved-city">

        <div class="saved-left">

          <div class="saved-icon">
            🌦️
          </div>

          <div>

            <h3>
              ${city.name}
            </h3>

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

    `).join("");
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

    new Notification(
      "🌦️ Bole Weather",
      {
        body:
          "Weather notifications are now enabled!"
      }
    );

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


  $("themeBtn").textContent =
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

  $("addCityPanel")
    .classList
    .remove("hidden");


  $("newCityInput").focus();


  $("addCityPanel")
    .scrollIntoView({
      behavior: "smooth"
    });
}


function closeAddCity() {

  $("addCityPanel")
    .classList
    .add("hidden");


  $("searchResults").innerHTML = "";

  $("newCityInput").value = "";
}


function showAddMessage(text) {

  $("addMessage").textContent = text;
}


/* =========================
   SAVE BUTTON
========================= */

function updateSaveButton(city) {

  const saved =
    state.cities.some(
      item => item.id === city.id
    );


  $("saveBtn").textContent =
    saved
      ? "★ Saved"
      : "☆ Save City";
}


$("saveBtn").addEventListener(
  "click",
  () => {

    if (!state.current)
      return;

    toggleSave(
      state.current.city
    );

  }
);


/* =========================
   HELPERS
========================= */

function formatTime(time) {

  return new Date(time)
    .toLocaleTimeString(
      [],
      {
        hour: "numeric",
        minute: "2-digit"
      }
    );
}


function showMessage(text) {

  $("message").textContent = text;
}


/* =========================
   EVENTS
========================= */

$("searchForm").addEventListener(
  "submit",
  e => {

    e.preventDefault();

    findCity(
      $("cityInput").value
    );

  }
);


$("addCityBtn").addEventListener(
  "click",
  openAddCity
);


$("closeAddBtn").addEventListener(
  "click",
  closeAddCity
);


$("findCityBtn").addEventListener(
  "click",
  () => {

    findCity(
      $("newCityInput").value
    );

  }
);


$("newCityInput").addEventListener(
  "keydown",
  e => {

    if (e.key === "Enter") {

      e.preventDefault();

      findCity(
        $("newCityInput").value
      );

    }

  }
);


$("notifyBtn").addEventListener(
  "click",
  enableNotifications
);


$("themeBtn").addEventListener(
  "click",
  toggleTheme
);


$("backBtn").addEventListener(
  "click",
  () => {

    $("detailsSection")
      .classList
      .add("hidden");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }
);


/* =========================
   START APP
========================= */

applyTheme();

renderSaved();

loadAllCities();