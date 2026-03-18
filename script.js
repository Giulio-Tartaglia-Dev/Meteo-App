
const API_KEY = "75df1ac3aef349dabd5163456261202";
const API_BASE_URL = "http://api.weatherapi.com/v1/forecast.json";


const cityInput = document.getElementById('cityInput');
const searchBtn = document.querySelector('.search-btn');
const btnText = document.querySelector('.btn-text');
const btnLoading = document.querySelector('.btn-loading');
const errorMessage = document.getElementById('errorMessage');
const weatherResults = document.getElementById('weatherResults');
const locationName = document.getElementById('locationName');
const currentDate = document.getElementById('currentDate');
const forecastCards = document.getElementById('forecastCards');
const hourlyForecast = document.getElementById('hourlyForecast');


cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather();
    }
});


async function getWeather() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    setLoading(true);
    hideError();
    hideResults();
    
    try {
        const weatherData = await fetchWeatherData(city);
        displayWeatherData(weatherData);
    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false);
    }
}


async function fetchWeatherData(city) {
    const url = `${API_BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(city)}&days=5&aqi=no&alerts=no`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Failed to fetch weather data');
    }
    
    const data = await response.json();
    
    if (data.error) {
        throw new Error(data.error.message);
    }
    
    return data;
}


function displayWeatherData(data) {
    const location = data.location;
    const forecast = data.forecast.forecastday;
    
  
    locationName.textContent = `${location.name}, ${location.country}`;
    currentDate.textContent = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
   
    displayForecastCards(forecast);
    
    
    displayHourlyForecast(forecast[0].hour);
    
    
    showResults();
}


function displayForecastCards(forecast) {
    forecastCards.innerHTML = '';
    
    forecast.forEach((day, index) => {
        const card = createForecastCard(day, index === 0);
        forecastCards.appendChild(card);
    });
}


function createForecastCard(day, isToday) {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    
    const date = new Date(day.date);
    const dateStr = isToday ? 'Today' : date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    });
    
    const clothingSuggestion = getClothingSuggestion(day.day.avgtemp_c);
    
    card.innerHTML = `
        <div class="forecast-date">${dateStr}</div>
        <div class="forecast-condition">${day.day.condition.text}</div>
        <div class="forecast-temps">
            <div class="temp-item">
                <div class="temp-label">High</div>
                <div class="temp-value">${day.day.maxtemp_c}°C</div>
            </div>
            <div class="temp-item">
                <div class="temp-label">Low</div>
                <div class="temp-value">${day.day.mintemp_c}°C</div>
            </div>
            <div class="temp-item">
                <div class="temp-label">Avg</div>
                <div class="temp-value">${day.day.avgtemp_c}°C</div>
            </div>
        </div>
        <div class="forecast-humidity">💧 ${day.day.avghumidity}% humidity</div>
        <div class="clothing-suggestion">
            <div class="clothing-label">👔 Clothing Suggestion:</div>
            <div class="clothing-text">${clothingSuggestion}</div>
        </div>
    `;
    
    return card;
}


function displayHourlyForecast(hours) {
    hourlyForecast.innerHTML = '';
    
    
    const nextHours = hours.slice(0, 8);
    
    nextHours.forEach(hour => {
        const hourlyItem = createHourlyItem(hour);
        hourlyForecast.appendChild(hourlyItem);
    });
}


function createHourlyItem(hour) {
    const item = document.createElement('div');
    item.className = 'hourly-item';
    
    const time = new Date(hour.time).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    item.innerHTML = `
        <div class="hourly-time">${time}</div>
        <div class="hourly-temp">${hour.temp_c}°C</div>
        <div class="hourly-condition">${hour.condition.text}</div>
    `;
    
    return item;
}


function getClothingSuggestion(temperature) {
    if (temperature < -10) {
        return "[VERY COLD] Extremely cold! Wear heavy winter coat, thermal underwear, warm boots, gloves, scarf, and hat.";
    } else if (temperature < 0) {
        return "[COLD] Very cold! Wear winter coat, warm layers, insulated boots, gloves, and hat.";
    } else if (temperature < 10) {
        return "[COOL] Cold! Wear warm jacket, sweater, long pants, and closed shoes.";
    } else if (temperature < 15) {
        return "[MILD-COOL] Cool! Wear light jacket or sweater, long pants, and comfortable shoes.";
    } else if (temperature < 20) {
        return "[MILD] Mild! Wear light jacket or cardigan, t-shirt, and jeans or casual pants.";
    } else if (temperature < 25) {
        return "[COMFORTABLE] Comfortable! Wear t-shirt, light pants or shorts, and comfortable shoes.";
    } else if (temperature < 30) {
        return "[WARM] Warm! Wear light clothing, shorts, t-shirt, and breathable fabrics.";
    } else {
        return "[HOT] Very hot! Wear minimal clothing, light colors, breathable fabrics, and stay hydrated!";
    }
}


function setLoading(isLoading) {
    searchBtn.disabled = isLoading;
    btnText.style.display = isLoading ? 'none' : 'inline';
    btnLoading.style.display = isLoading ? 'inline' : 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showResults() {
    weatherResults.style.display = 'block';
}

function hideResults() {
    weatherResults.style.display = 'none';
}


document.addEventListener('DOMContentLoaded', () => {

    cityInput.focus();
    
  
    const sampleCities = ['London', 'New York', 'Tokyo', 'Paris', 'Sydney'];
    cityInput.placeholder = `Enter city name... (e.g., ${sampleCities[Math.floor(Math.random() * sampleCities.length)]})`;
});
