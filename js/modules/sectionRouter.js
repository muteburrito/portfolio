function getSectionTitle(sectionId, menuButtons, sections) {
  const matchButton = Array.from(menuButtons).find(
    (button) => button.dataset.sectionTarget === sectionId
  );
  if (matchButton) {
    return matchButton.textContent?.trim() || 'Overview';
  }

  const section = Array.from(sections).find((item) => item.id === sectionId);
  return section?.querySelector('h2')?.textContent?.trim() || 'Overview';
}

export function initSectionRouter({
  sections,
  menuButtons,
  breadcrumbElement,
  commandElement,
  mobileCommandElement,
  menuElement,
  menuToggle,
  menuClose,
  menuBackdrop,
}) {
  if (!sections.length) {
    return;
  }

  const mainElement = sections[0]?.closest('main');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const validIds = new Set(Array.from(sections).map((section) => section.id));
  let activeSectionId = null;
  let desktopTypingTimer = null;
  let mobileTypingTimer = null;
  let mobileHideTimer = null;

  const animateTypedText = (element, text, speed, onDone) => {
    if (!element) {
      return;
    }

    let idx = 0;
    element.textContent = '';
    const timer = window.setInterval(() => {
      element.textContent = text.slice(0, idx + 1);
      idx += 1;
      if (idx >= text.length) {
        window.clearInterval(timer);
        onDone?.();
      }
    }, speed);

    return timer;
  };

  const animateCommand = (targetId) => {
    const command = `~$ cd /${targetId}`;

    if (desktopTypingTimer) {
      window.clearInterval(desktopTypingTimer);
    }
    if (mobileTypingTimer) {
      window.clearInterval(mobileTypingTimer);
    }
    if (mobileHideTimer) {
      window.clearTimeout(mobileHideTimer);
    }

    desktopTypingTimer = animateTypedText(commandElement, command, 24);

    if (mobileCommandElement) {
      mobileCommandElement.classList.add('active');
      mobileTypingTimer = animateTypedText(mobileCommandElement, command, 20, () => {
        mobileHideTimer = window.setTimeout(() => {
          mobileCommandElement.classList.remove('active');
        }, 820);
      });
    }
  };

  const syncSectionVisibility = (targetId) => {
    sections.forEach((section) => {
      const isTarget = section.id === targetId;
      section.hidden = !isTarget;
      section.style.display = isTarget ? 'grid' : 'none';
      section.classList.toggle('section-active', isTarget);
      section.classList.remove('cli-enter', 'cli-enter-active', 'cli-exit');
    });
    activeSectionId = targetId;
  };

  const openMenu = () => {
    if (!menuElement || !menuToggle || !menuBackdrop) {
      return;
    }

    menuElement.hidden = false;
    menuBackdrop.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  };

  const closeMenu = () => {
    if (!menuElement || !menuToggle || !menuBackdrop) {
      return;
    }

    menuElement.hidden = true;
    menuBackdrop.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  const setActiveSection = (sectionId, updateHash = true, forceNoAnimation = false) => {
    const targetId = validIds.has(sectionId) ? sectionId : 'home';

    menuButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.sectionTarget === targetId);
    });

    if (breadcrumbElement) {
      breadcrumbElement.textContent = getSectionTitle(targetId, menuButtons, sections);
    }
    animateCommand(targetId);

    if (activeSectionId !== targetId) {
      const currentSection = Array.from(sections).find((section) => section.id === activeSectionId);
      const nextSection = Array.from(sections).find((section) => section.id === targetId);

      if (!currentSection || !nextSection || prefersReducedMotion || forceNoAnimation) {
        syncSectionVisibility(targetId);
      } else {
        mainElement?.classList.add('cli-switching');
        currentSection.classList.add('cli-exit');

        window.setTimeout(() => {
          currentSection.hidden = true;
          currentSection.style.display = 'none';
          currentSection.classList.remove('section-active', 'cli-exit');

          nextSection.hidden = false;
          nextSection.style.display = 'grid';
          nextSection.classList.add('section-active', 'cli-enter');

          requestAnimationFrame(() => {
            nextSection.classList.add('cli-enter-active');
          });

          window.setTimeout(() => {
            nextSection.classList.remove('cli-enter', 'cli-enter-active');
            mainElement?.classList.remove('cli-switching');
          }, 340);
        }, 160);

        activeSectionId = targetId;
      }
    }

    if (updateHash && window.location.hash !== `#${targetId}`) {
      history.replaceState(null, '', `#${targetId}`);
    }

    closeMenu();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  menuButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setActiveSection(button.dataset.sectionTarget || 'home');
    });
  });

  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menuClose?.addEventListener('click', closeMenu);
  menuBackdrop?.addEventListener('click', closeMenu);

  window.addEventListener('hashchange', () => {
    const hashId = window.location.hash.replace('#', '');
    setActiveSection(hashId || 'home', false, false);
  });

  const initialHash = window.location.hash.replace('#', '');
  setActiveSection(initialHash || 'home', false, true);
}
