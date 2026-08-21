 this is my weather App link it's has been hosted in github 
 https://kidusgm.github.io/KidusGM/
 # 🌦️ Modern Weather Website

A responsive weather web application that provides **live weather conditions and forecasts for cities across Ethiopia**.

> ☔ **Check the sky before you grab the umbrella.**

## ✨ Features

* 🔎 Search for cities using the Open-Meteo Geocoding API
* 🇪🇹 Preloaded Ethiopian cities
* ⭐ Save and remove favorite cities
* 🌡️ View current temperature and weather conditions
* 🕐 Hourly weather forecast
* 📅 7-day forecast
* 🌧️ Rain probability and temperature charts
* 🔍 Filter cities by name and weather condition
* 🌙 Light and dark mode
* 🔔 Browser notification support
* 💾 Save cities and theme preferences with `localStorage`
* 📱 Responsive design for desktop, tablet, and mobile

## 🛠️ Technologies

* HTML5
* CSS3
* JavaScript
* Chart.js
* Open-Meteo API
* LocalStorage
* Browser Notifications API

## 📁 Project Structure

```text
Bole-Weather/
├── index.html
├── styles.css
├── app.js
├── cities.json
└── README.md
```

## 🚀 How to Run

1. Clone or download the project.
2. Open the folder in VS Code.
3. Run `index.html` using **Live Server**.

> A local server is recommended because the application loads `cities.json` using `fetch()`.

## 🌐 APIs

**Open-Meteo Geocoding API**
Used to search and locate cities.

**Open-Meteo Weather API**
Used to retrieve current weather, hourly forecasts, and daily forecasts.

## 💾 Local Storage

The application stores:

* Saved cities → `weatherCities`
* Selected theme → `weatherTheme`

## 👨‍💻 Author

**Kidus**

Built as a frontend development project for learning and portfolio purposes.

## 📄 Credits

Weather data: **Open-Meteo**
Charts: **Chart.js**
