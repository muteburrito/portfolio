export function initScrollSpy(navLinks, sections) {
  if (!navLinks.length || !sections.length) {
    return;
  }

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const sectionId = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          const isActive = link.getAttribute('href') === `#${sectionId}`;
          link.classList.toggle('active', isActive);
        });
      });
    },
    {
      threshold: 0.35,
      rootMargin: '-10% 0px -48% 0px',
    }
  );

  sections.forEach((section) => navObserver.observe(section));
}
