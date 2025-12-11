const API_URL = "http://127.0.0.1:5000/meteo";

const icons = {
    "01d": "☀️", "01n": "🌙", "02d": "⛅", "02n": "☁️",
    "03d": "☁️", "03n": "☁️", "04d": "☁️", "04n": "☁️",
    "09d": "🌧️", "09n": "🌧️", "10d": "🌦️", "10n": "🌧️",
    "11d": "⛈️", "11n": "⛈️", "13d": "❄️", "13n": "❄️",
    "50d": "🌫️", "50n": "🌫️"
};

// Crea particelle animate
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 25 + 's';
        particle.style.animationDuration = (20 + Math.random() * 15) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Lista città per autocompletamento
const cities = [
    "Roma", "Milano", "Napoli", "Torino", "Palermo", "Genova", "Bologna", "Firenze", "Bari", "Catania",
    "Venezia", "Verona", "Padova", "Trieste", "Parma", "Modena", "Reggio Emilia", "Perugia", "Livorno",
    "Parigi", "Londra", "Berlino", "Madrid", "Barcellona", "Amsterdam", "Vienna", "Praga", "Budapest",
    "New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "San Francisco", "Boston", "Seattle",
    "Tokyo", "Osaka", "Kyoto", "Seoul", "Shanghai", "Beijing", "Hong Kong", "Singapore", "Bangkok",
    "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Mosca", "San Pietroburgo", "Kiev"
];

// Autocompletamento
function setupAutocomplete() {
    const input = document.getElementById("cityInput");
    const dropdown = document.createElement("div");
    dropdown.className = "suggestions-dropdown";
    dropdown.id = "suggestionsDropdown";
    input.parentNode.appendChild(dropdown);
    
    input.addEventListener("input", function() {
        const value = this.value.toLowerCase();
        dropdown.innerHTML = "";
        
        if (value.length > 0) {
            const matches = cities.filter(city => 
                city.toLowerCase().includes(value)
            ).slice(0, 5);
            
            if (matches.length > 0) {
                matches.forEach(city => {
                    const item = document.createElement("div");
                    item.className = "suggestion-item";
                    item.textContent = city;
                    item.onclick = () => {
                        input.value = city;
                        dropdown.style.display = "none";
                        getWeather();
                    };
                    dropdown.appendChild(item);
                });
                dropdown.style.display = "block";
            } else {
                dropdown.style.display = "none";
            }
        } else {
            dropdown.style.display = "none";
        }
    });
    
    input.addEventListener("blur", function() {
        setTimeout(() => dropdown.style.display = "none", 200);
    });
}

// Enter key per cercare
document.getElementById("cityInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        document.getElementById("suggestionsDropdown").style.display = "none";
        getWeather();
    }
});

async function getWeather() {
    const city = document.getElementById("cityInput").value.trim() || loadLastCity();
    const loaderWrapper = document.getElementById("loaderWrapper");
    const mainInfo = document.getElementById("mainInfo");
    const weatherDetails = document.getElementById("weatherDetails");
    const welcomeMsg = document.getElementById("welcomeMsg");
    const errorMsg = document.getElementById("errorMsg");

    // Salva l'ultima città cercata
    saveLastCity(city);

    // Reset UI
    loaderWrapper.style.display = "block";
    mainInfo.style.display = "none";
    weatherDetails.style.display = "none";
    welcomeMsg.style.display = "none";
    errorMsg.style.display = "none";

    try {
        const res = await fetch(`${API_URL}?city=${encodeURIComponent(city)}`);
        if (!res.ok) throw new Error("Città non trovata");
        const data = await res.json();
        if (data.errore) throw new Error(data.errore);

        // Aggiorna pannello sinistro
        document.getElementById("city").innerText = `${data.città}, ${data.paese}`;
        document.getElementById("temp").innerText = Math.round(data.temperatura) + "°";
        document.getElementById("desc").innerText = data.descrizione;
        document.getElementById("icon").innerText = icons[data.icona] || "🌤️";

        // Aggiorna pannello destro
        document.getElementById("feels").innerText = data.temp_percepita + "°";
        document.getElementById("humidity").innerText = data.umidità + "%";
        document.getElementById("wind").innerText = data.vento + " km/h";
        document.getElementById("time").innerText = data.ora_richiesta.split(" ")[1];

        // Aggiorna previsioni
        const forecastDiv = document.getElementById("forecast");
        forecastDiv.innerHTML = "";
        data.previsioni.forEach(item => {
            const el = document.createElement("div");
            el.className = "forecast-item";
            el.innerHTML = `
                <div class="forecast-time">${item.ora}</div>
                <div class="forecast-icon">${icons[item.icona] || "☁️"}</div>
                <div class="forecast-temp">${Math.round(item.temp)}°</div>
            `;
            forecastDiv.appendChild(el);
        });

        // Cambia sfondo
        changeBackground(data.icona);

        // Mostra contenuto
        mainInfo.style.display = "flex";
        weatherDetails.style.display = "block";

    } catch (err) {
        errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${err.message}`;
        errorMsg.style.display = "block";
        welcomeMsg.style.display = "flex";
        setTimeout(() => errorMsg.style.display = "none", 4000);
    } finally {
        loaderWrapper.style.display = "none";
    }
}

function changeBackground(code) {
    const leftPanel = document.querySelector('.left-panel');
    let gradient = "";
    
    if (code.includes("01")) {
        gradient = "linear-gradient(180deg, #f59e0b 0%, #ea580c 100%)"; // Sole - arancione
    } else if (code.includes("02")) {
        gradient = "linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)"; // Poche nuvole - azzurro
    } else if (code.includes("09") || code.includes("10")) {
        gradient = "linear-gradient(180deg, #475569 0%, #334155 100%)"; // Pioggia - grigio scuro
    } else if (code.includes("11")) {
        gradient = "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)"; // Temporale - molto scuro
    } else if (code.includes("13")) {
        gradient = "linear-gradient(180deg, #7dd3fc 0%, #38bdf8 100%)"; // Neve - azzurro chiaro
    } else if (code.includes("50")) {
        gradient = "linear-gradient(180deg, #94a3b8 0%, #64748b 100%)"; // Nebbia - grigio
    } else {
        gradient = "linear-gradient(180deg, #667eea 0%, #764ba2 100%)"; // Default
    }
    
    leftPanel.style.background = gradient;
}

// Salva e carica ultima città
function saveLastCity(city) {
    localStorage.setItem('lastSearchedCity', city);
}

function loadLastCity() {
    return localStorage.getItem('lastSearchedCity') || 'Roma';
}

// Inizializza
createParticles();
setupAutocomplete();
document.getElementById('cityInput').value = loadLastCity();
window.onload = getWeather;