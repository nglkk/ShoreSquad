// Main JavaScript for ShoreSquad

// Configuration
const config = {
    weatherApiKey: 'YOUR_OPENWEATHER_API_KEY', // Replace with actual API key
    eventDetails: {
        title: "Beach Cleanup at Pasir Ris",
        date: "June 8, 2025",
        time: "8:00 AM - 11:00 AM",
        location: "Pasir Ris Park Car Park D",
        coordinates: {
            lat: 1.381497,
            lng: 103.955574
        }
    }
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
    setupEventButtons();
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

// Event Handlers
function setupEventButtons() {
    const registerButton = document.querySelector('.register-button');
    const shareButton = document.querySelector('.share-button');

    if (registerButton) {
        registerButton.addEventListener('click', handleRegistration);
    }

    if (shareButton) {
        shareButton.addEventListener('click', handleShare);
    }
}

function handleRegistration() {
    // In a real app, this would open a registration form or modal
    const message = `Thank you for your interest in joining the cleanup!\n\n` +
                   `Event: ${config.eventDetails.title}\n` +
                   `Date: ${config.eventDetails.date}\n` +
                   `Time: ${config.eventDetails.time}\n` +
                   `Location: ${config.eventDetails.location}`;
    
    alert(message);
}

async function handleShare() {
    const shareData = {
        title: config.eventDetails.title,
        text: `Join us for a beach cleanup!\n` +
              `Date: ${config.eventDetails.date}\n` +
              `Time: ${config.eventDetails.time}\n` +
              `Location: ${config.eventDetails.location}`,
        url: window.location.href
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Fallback for browsers that don't support the Web Share API
            alert('Share this event:\n\n' + shareData.text);
        }
    } catch (err) {
        console.error('Error sharing:', err);
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
