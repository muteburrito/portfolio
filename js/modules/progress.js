export function initScrollProgress(progressBarElement) {
  if (!progressBarElement) {
    return;
  }

  const updateScrollProgress = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) {
      progressBarElement.style.width = '0%';
      return;
    }

    const progress = Math.min((window.scrollY / maxScroll) * 100, 100);
    progressBarElement.style.width = `${progress}%`;
  };

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('resize', updateScrollProgress);
  updateScrollProgress();
}
