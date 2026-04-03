// Loads HTML partials defined via data-include attributes and replaces placeholders.
export async function loadHtmlPartials() {
  const placeholders = Array.from(document.querySelectorAll('[data-include]'));
  const buildVersion = document
    .querySelector('meta[name="build-version"]')
    ?.getAttribute('content')
    ?.trim();

  if (!placeholders.length) {
    return;
  }

  await Promise.all(
    placeholders.map(async (node) => {
      const includePath = node.getAttribute('data-include');
      if (!includePath) {
        return;
      }

      const includeUrl = withVersion(includePath, buildVersion);

      try {
        const response = await fetch(includeUrl, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load ${includeUrl}: ${response.status}`);
        }

        const html = await response.text();
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        node.replaceWith(template.content);
      } catch (error) {
        console.error('Include error:', error);
        node.remove();
      }
    })
  );
}

function withVersion(path, version) {
  if (!version || !path || /^https?:\/\//i.test(path)) {
    return path;
  }

  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}v=${encodeURIComponent(version)}`;
}
