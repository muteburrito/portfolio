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

    const leafletMap = L.map('loc-map', {
      center: [LAT, LNG],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
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

    const refreshMap = () => {
      requestAnimationFrame(() => leafletMap.invalidateSize());
    };

    const observer = new MutationObserver(() => {
      if (!locationSection.hidden && locationSection.style.display !== 'none') {
        refreshMap();
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
