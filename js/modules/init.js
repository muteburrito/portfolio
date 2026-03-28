import { initTypewriter } from './typewriter.js';
import { initRevealAnimations } from './reveal.js';
import { initScrollSpy } from './navigation.js';
import { initScrollProgress } from './progress.js';
import { initTiltCards } from './tilt.js';

export function initSiteInteractions() {
  const revealElements = document.querySelectorAll('.reveal');
  const typedCommandElement = document.getElementById('typed-command');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  const sections = document.querySelectorAll('main section[id]');
  const tiltCards = document.querySelectorAll('.tilt');
  const scrollProgressBar = document.getElementById('scroll-progress-bar');

  initTypewriter(typedCommandElement);
  initRevealAnimations(revealElements);
  initScrollSpy(navLinks, sections);
  initScrollProgress(scrollProgressBar);
  initTiltCards(tiltCards);
}
