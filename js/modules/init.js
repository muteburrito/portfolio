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
}
