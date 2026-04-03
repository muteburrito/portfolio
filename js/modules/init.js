import { initTypewriter } from './typewriter.js';
import { initRevealAnimations } from './reveal.js';
import { initTiltCards } from './tilt.js';
import { initSectionRouter } from './sectionRouter.js';

export function initSiteInteractions() {
  const mainElement = document.querySelector('main');
  const revealElements = document.querySelectorAll('.reveal');
  const typedCommandElement = document.getElementById('typed-command');
  const sections = document.querySelectorAll('main section[id]');
  const tiltCards = document.querySelectorAll('.tilt');
  const menuButtons = document.querySelectorAll('[data-section-target]');
  const breadcrumbElement = document.getElementById('current-breadcrumb');
  const commandElement = document.getElementById('switch-command');
  const mobileCommandElement = document.getElementById('mobile-switch-shell');
  const menuElement = document.getElementById('section-menu');
  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');
  const menuBackdrop = document.getElementById('menu-backdrop');

  initSectionRouter({
    sections,
    menuButtons,
    breadcrumbElement,
    commandElement,
    mobileCommandElement,
    menuElement,
    menuToggle,
    menuClose,
    menuBackdrop,
  });

  mainElement?.classList.add('router-ready');
  initTypewriter(typedCommandElement);
  initRevealAnimations(revealElements);
  initTiltCards(tiltCards);

  const locClock = document.getElementById('loc-clock');
  if (locClock) {
    const tickClock = () => {
      const ist = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const hh = String(ist.getHours()).padStart(2, '0');
      const mm = String(ist.getMinutes()).padStart(2, '0');
      const ss = String(ist.getSeconds()).padStart(2, '0');
      locClock.textContent = `${hh}:${mm}:${ss} IST`;
    };
    tickClock();
    setInterval(tickClock, 1000);
  }

  const locationSection = document.getElementById('location');
  const mapContainer = document.getElementById('loc-map');
  if (locationSection && mapContainer && typeof L !== 'undefined') {
    const LAT = 18.4950598;
    const LNG = 73.8294085;
    const mapShell = document.getElementById('loc-map-shell');
    const expandButton = document.getElementById('loc-map-expand');
    const geolocateButton = document.getElementById('loc-map-geolocate');
    const manualButton = document.getElementById('loc-map-manual');
    const resetButton = document.getElementById('loc-map-reset');
    const distanceStatus = document.getElementById('loc-distance-status');
    const baseLatLng = L.latLng(LAT, LNG);
    const defaultZoom = 15;
    let mapExpanded = false;
    let manualPickMode = false;
    let userMarker = null;
    let userLine = null;
    let mapHomeParent = null;
    let mapHomeNextSibling = null;

    const leafletMap = L.map('loc-map', {
      center: [LAT, LNG],
      zoom: defaultZoom,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(leafletMap);

    const markerIcon = L.divIcon({
      html: '<div class="loc-marker"><div class="loc-marker-dot"></div><div class="loc-marker-ring"></div></div>',
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([LAT, LNG], { icon: markerIcon }).addTo(leafletMap);

    const resetMapView = ({ clearUserOverlay = false } = {}) => {
      leafletMap.setView(baseLatLng, defaultZoom);

      if (clearUserOverlay) {
        if (userMarker) {
          leafletMap.removeLayer(userMarker);
          userMarker = null;
        }

        if (userLine) {
          leafletMap.removeLayer(userLine);
          userLine = null;
        }

        setDistanceStatus('Distance unavailable until you share location.');
      }

      setManualPickMode(false);

      refreshMap();
    };

    const refreshMap = () => {
      requestAnimationFrame(() => leafletMap.invalidateSize());
    };

    const setDistanceStatus = (message, state = '') => {
      if (!distanceStatus) {
        return;
      }

      distanceStatus.textContent = message;
      distanceStatus.classList.remove('ready', 'error');
      if (state) {
        distanceStatus.classList.add(state);
      }
    };

    const setMapExpanded = (expanded) => {
      if (!mapShell || !expandButton) {
        return;
      }

      if (!mapHomeParent) {
        mapHomeParent = mapShell.parentElement;
        mapHomeNextSibling = mapShell.nextSibling;
      }

      mapExpanded = expanded;

      if (expanded) {
        document.body.appendChild(mapShell);
      } else if (mapHomeParent) {
        mapHomeParent.insertBefore(mapShell, mapHomeNextSibling);
      }

      mapShell.classList.toggle('loc-map-shell--expanded', expanded);
      document.body.classList.toggle('loc-map-expanded', expanded);
      expandButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      expandButton.textContent = expanded ? 'Collapse Map' : 'Expand Map';

      if (expanded) {
        leafletMap.scrollWheelZoom.enable();
      } else {
        leafletMap.scrollWheelZoom.disable();
      }

      refreshMap();
    };

    const applyUserLocation = (userLatLng, { source = 'device', accuracyMeters = null } = {}) => {
      if (!userMarker) {
        const userIcon = L.divIcon({
          html: '<div class="loc-user-marker"></div>',
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        userMarker = L.marker(userLatLng, { icon: userIcon }).addTo(leafletMap);
      } else {
        userMarker.setLatLng(userLatLng);
      }

      if (!userLine) {
        userLine = L.polyline([userLatLng, baseLatLng], {
          color: '#5ff4b7',
          weight: 2,
          opacity: 0.8,
          dashArray: '6 6',
        }).addTo(leafletMap);
      } else {
        userLine.setLatLngs([userLatLng, baseLatLng]);
      }

      const meters = userLatLng.distanceTo(baseLatLng);
      const km = meters / 1000;
      const formattedDistance = km >= 1000 ? `${Math.round(km).toLocaleString()} km` : `${km.toFixed(1)} km`;

      if (source === 'manual') {
        setDistanceStatus(`Manual pin set. You are approximately ${formattedDistance} away from Pune.`, 'ready');
      } else {
        const accuracyText = accuracyMeters ? ` (accuracy ~${accuracyMeters} m)` : '';
        const coarseHint = accuracyMeters && accuracyMeters > 5000 ? ' This looks like a coarse network-based fix.' : '';
        setDistanceStatus(
          `You are approximately ${formattedDistance} away from Pune${accuracyText}.${coarseHint}`,
          accuracyMeters && accuracyMeters > 5000 ? 'error' : 'ready'
        );
      }

      const bounds = L.latLngBounds([userLatLng, baseLatLng]);
      leafletMap.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
    };

    const getCurrentPositionOnce =
      (options) =>
      () =>
        new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });

    const getBestDevicePosition = async () => {
      const options = {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      };

      const attempt = getCurrentPositionOnce(options);
      let best = null;
      let lastError = null;

      for (let i = 0; i < 3; i += 1) {
        try {
          const position = await attempt();
          if (!best || position.coords.accuracy < best.coords.accuracy) {
            best = position;
          }

          if (position.coords.accuracy <= 100) {
            break;
          }
        } catch (error) {
          lastError = error;
        }
      }

      if (best) {
        return best;
      }

      throw lastError || new Error('Unable to resolve location');
    };

    function setManualPickMode(enabled) {
      manualPickMode = enabled;
      mapContainer.classList.toggle('loc-map-manual', enabled);

      if (!manualButton) {
        return;
      }

      manualButton.classList.toggle('active', enabled);
      manualButton.textContent = enabled ? 'Cancel Manual Pin' : 'Set Location Manually';

      if (enabled) {
        setDistanceStatus('Click on the map to place your location pin.', '');
      }
    }

    const handleLocateUser = () => {
      if (!navigator.geolocation) {
        setDistanceStatus('Geolocation is not supported on this browser.', 'error');
        return;
      }

      setManualPickMode(false);
      setDistanceStatus('Resolving your precise location from your device...', '');

      getBestDevicePosition()
        .then(({ coords }) => {
          const userLatLng = L.latLng(coords.latitude, coords.longitude);
          const accuracyMeters = Number.isFinite(coords.accuracy) ? Math.round(coords.accuracy) : null;
          applyUserLocation(userLatLng, { source: 'device', accuracyMeters });
        })
        .catch((error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setDistanceStatus('Location permission denied. Use Google Maps link instead.', 'error');
            return;
          }

          setDistanceStatus('Could not get precise location. Try manual pin mode.', 'error');
        });
    };

    expandButton?.addEventListener('click', () => {
      setMapExpanded(!mapExpanded);
    });

    geolocateButton?.addEventListener('click', handleLocateUser);
    manualButton?.addEventListener('click', () => {
      setManualPickMode(!manualPickMode);
    });
    resetButton?.addEventListener('click', () => {
      resetMapView({ clearUserOverlay: true });
    });

    leafletMap.on('click', (event) => {
      if (!manualPickMode) {
        return;
      }

      applyUserLocation(event.latlng, { source: 'manual' });
      setManualPickMode(false);
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mapExpanded) {
        setMapExpanded(false);
      }
    });

    const observer = new MutationObserver(() => {
      if (!locationSection.hidden && locationSection.style.display !== 'none') {
        refreshMap();
      } else if (mapExpanded) {
        setMapExpanded(false);
      }
    });

    observer.observe(locationSection, { attributes: true, attributeFilter: ['hidden', 'style'] });

    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#location') refreshMap();
    });

    if (!locationSection.hidden) {
      refreshMap();
    }
  }
}
