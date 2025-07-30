import "./styles.css";
import { greeting } from "./greeting.js";  
console.log(greeting);

document.querySelector("body").innerHTML = `
  <div id="greeting">${greeting}</div>
  <div id="weather-app">
    <input type="text" id="location-input" placeholder="Enter location" />
    <select id="unit-select">
      <option value="metric">Metric (°C, km)</option>
      <option value="us">US (°F, miles)</option>
      <option value="uk">UK (°C, miles)</option>
    </select>
    <button id="get-weather-btn">Get Weather</button>
    <div id="weather-result"></div>
  </div>
`;

function getWeather() {
  const location = document.getElementById("location-input").value.trim();
  const unit = document.getElementById("unit-select").value;
  const resultDiv = document.getElementById("weather-result");
  if (!location) {
    resultDiv.textContent = "Please enter a location.";
    return;
  }

  resultDiv.textContent = "Loading...";

  fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=${unit}&include=fcst%2Ccurrent&key=MXVWLBYDAXD22WYZTWQ8R8SYR&contentType=json`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(data => {
      if (data && data.currentConditions) {
        const condition = data.currentConditions.conditions;
        const description = data.description || ""; // fallback if not present
        const weatherHtml = `
          <strong>Weather in ${data.resolvedAddress}:</strong><br>
          Temperature: ${data.currentConditions.temp}${unit === "us" ? "°F" : "°C"}<br>
          Condition: ${condition}<br>
          <em>${description}</em>
        `;
        // Fetch GIF from Giphy
        fetch(`https://api.giphy.com/v1/gifs/search?api_key=7nQcv9IJoz9COa182hQPljVRmCqJNnBy&q=sky+${encodeURIComponent(condition)}&limit=1&offset=0&rating=g&lang=en&bundle=messaging_non_clips`)
          .then(giphyRes => giphyRes.json())
          .then(giphyData => {
            let gifHtml = "";
            if (giphyData.data && giphyData.data.length > 0) {
              const gifUrl = giphyData.data[0].images.fixed_height.url;
              gifHtml = `<img src="${gifUrl}" alt="${condition} gif" style="margin-top:10px;max-width:100%;height:auto;">`;
            }
            resultDiv.innerHTML = weatherHtml + '<br>' + gifHtml;
          })
          .catch(() => {
            resultDiv.innerHTML = weatherHtml + "<br>Could not load GIF.";
          });
      } else {
        resultDiv.textContent = "No weather data found for this location.";
      }
    })
    .catch(err => {
      resultDiv.textContent = "Error fetching weather data. Please check the location and try again.";
      console.error(err);
    });
}

document.getElementById("get-weather-btn").addEventListener("click", getWeather);
document.getElementById("location-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    getWeather();
  }
});
