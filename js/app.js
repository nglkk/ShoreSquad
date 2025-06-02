// Main JavaScript for ShoreSquad

// Configuration
const config = {
    weatherApiKey: 'YOUR_OPENWEATHER_API_KEY', // Replace with actual API key
    mapApiKey: 'YOUR_GOOGLE_MAPS_API_KEY',     // Replace with actual API key
    weatherApiEndpoint: 'https://api.openweathermap.org/data/2.5/weather'
};

// State management
const state = {
    userLocation: null,
    weatherData: null,
    markers: [],
    map: null
};

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    const ctaButton = document.querySelector('.cta-button');
    await getUserLocation();
    initializeWeatherWidget();
    initializeMap();
    setupEventListeners();
}

// Geolocation
async function getUserLocation() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    state.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    resolve(state.userLocation);
                },
                error => {
                    console.error('Error getting location:', error);
                    state.userLocation = { lat: 51.5074, lng: -0.1278 }; // Default to London
                    resolve(state.userLocation);
                }
            );
        } else {
            console.error('Geolocation not supported');
            state.userLocation = { lat: 51.5074, lng: -0.1278 }; // Default to London
            resolve(state.userLocation);
        }
    });
}

// Weather Widget
async function initializeWeatherWidget() {
    if (!state.userLocation) return;

    try {
        const response = await fetch(
            `${config.weatherApiEndpoint}?lat=${state.userLocation.lat}&lon=${state.userLocation.lng}&appid=${config.weatherApiKey}&units=metric`
        );
        const data = await response.json();
        state.weatherData = data;
        updateWeatherWidget(data);
    } catch (error) {
        console.error('Error fetching weather:', error);
    }
}

function updateWeatherWidget(data) {
    const weatherHtml = `
        <div id="weather-widget">
            <h3>Current Weather</h3>
            <p>${data.main.temp}°C</p>
            <p>${data.weather[0].description}</p>
            <p>Wind: ${data.wind.speed} m/s</p>
        </div>
    `;
    
    // Insert weather widget into the page
    const weatherContainer = document.getElementById('weather-widget') || document.createElement('div');
    weatherContainer.innerHTML = weatherHtml;
    if (!document.getElementById('weather-widget')) {
        document.body.appendChild(weatherContainer);
    }
}

// Map Integration
function initializeMap() {
    if (!state.userLocation) return;
    
    // Create map div if it doesn't exist
    if (!document.getElementById('map')) {
        const mapDiv = document.createElement('div');
        mapDiv.id = 'map';
        document.querySelector('main').appendChild(mapDiv);
    }

    // Initialize Google Maps (requires Google Maps JavaScript API to be loaded)
    state.map = new google.maps.Map(document.getElementById('map'), {
        center: state.userLocation,
        zoom: 12
    });

    // Add example cleanup events (replace with real data)
    addCleanupEvents();
}

function addCleanupEvents() {
    const events = [
        {
            position: state.userLocation,
            title: "Weekend Beach Cleanup",
            date: "Next Saturday, 10 AM"
        },
        {
            position: {
                lat: state.userLocation.lat + 0.01,
                lng: state.userLocation.lng + 0.01
            },
            title: "Community Coastal Cleanup",
            date: "Next Sunday, 9 AM"
        }
    ];

    events.forEach(event => {
        const marker = new google.maps.Marker({
            position: event.position,
            map: state.map,
            title: event.title
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `
                <h3>${event.title}</h3>
                <p>${event.date}</p>
                <button onclick="joinEvent('${event.title}')">Join Event</button>
            `
        });

        marker.addListener('click', () => {
            infoWindow.open(state.map, marker);
        });

        state.markers.push(marker);
    });
}

// Event Handling
function setupEventListeners() {
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            if (state.map) {
                // Smooth scroll to map
                document.getElementById('map').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            }
        });
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Event joining function
window.joinEvent = function(eventTitle) {
    alert(`Thanks for joining ${eventTitle}! We'll send you the details shortly.`);
};
