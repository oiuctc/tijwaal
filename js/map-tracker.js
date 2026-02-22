/* =========================================================
   TIJWAAL – MAP TRACKER
   Provides real-time location tracking and map rendering using Leaflet.js
   ========================================================= */

class MapTracker {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.map = null;
        this.marker = null;
        this.watchId = null;
        this.defaultLat = options.defaultLat || 24.7136; // Riyadh
        this.defaultLng = options.defaultLng || 46.6753;
        this.zoom = options.zoom || 15;
    }

    init() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // Initialize Leaflet Map
        this.map = L.map(this.containerId, {
            zoomControl: false // Custom controls if needed
        }).setView([this.defaultLat, this.defaultLng], this.zoom);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Custom icon for provider
        const icon = L.divIcon({
            className: 'custom-map-marker',
            html: '<div style="width:20px;height:20px;background:var(--danger);border:3px solid #fff;border-radius:50%;box-shadow:0 0 10px rgba(0,0,0,0.5);animation:pulse 1.5s infinite;"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        this.marker = L.marker([this.defaultLat, this.defaultLng], { icon }).addTo(this.map);
    }

    startTracking(onLocationUpdate) {
        if (!navigator.geolocation) {
            console.error('Geolocation is not supported by your browser');
            if (window.showToast) showToast('Geolocation is not supported', 'danger');
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // Update map
                if (this.map && this.marker) {
                    const newLatLng = new L.LatLng(lat, lng);
                    this.marker.setLatLng(newLatLng);
                    this.map.setView(newLatLng);
                }

                if (onLocationUpdate) {
                    onLocationUpdate(position);
                }
            },
            (error) => {
                console.error('Error tracking location:', error);
                if (window.showToast) showToast('Failed to get location: ' + error.message, 'danger');
            },
            options
        );
    }

    stopTracking() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }
}

// Global exposure
window.MapTracker = MapTracker;
