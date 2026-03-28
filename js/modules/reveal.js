function animateCounter(counter) {
  const target = Number(counter.dataset.target || 0);
  const duration = 1200;
  const frameStep = 16;
  const totalFrames = Math.round(duration / frameStep);
  let frame = 0;

  const timer = setInterval(() => {
    frame += 1;
    const progress = frame / totalFrames;
    const current = Math.round(target * (1 - Math.pow(1 - progress, 3)));
    counter.textContent = String(current);

    if (frame >= totalFrames) {
      counter.textContent = String(target);
      clearInterval(timer);
    }
  }, frameStep);
}

export function initRevealAnimations(elements) {
  if (!elements.length) {
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('visible');
        entry.target.classList.add('scan-active');
        setTimeout(() => entry.target.classList.remove('scan-active'), 760);

        if (entry.target.classList.contains('metric-card')) {
          const counter = entry.target.querySelector('.counter');
          if (counter && !counter.dataset.animated) {
            counter.dataset.animated = 'true';
            animateCounter(counter);
          }
        }

        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.16 }
  );

  elements.forEach((element, index) => {
    element.style.transitionDelay = `${(index % 6) * 55}ms`;
    revealObserver.observe(element);
  });
}
