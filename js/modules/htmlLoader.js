// Loads HTML partials defined via data-include attributes and replaces placeholders.
export async function loadHtmlPartials() {
  const placeholders = Array.from(document.querySelectorAll('[data-include]'));

  if (!placeholders.length) {
    return;
  }

  await Promise.all(
    placeholders.map(async (node) => {
      const includePath = node.getAttribute('data-include');
      if (!includePath) {
        return;
      }

      try {
        const response = await fetch(includePath);
        if (!response.ok) {
          throw new Error(`Failed to load ${includePath}: ${response.status}`);
        }

        const html = await response.text();
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        node.replaceWith(template.content);
      } catch (error) {
        console.error('Include error:', error);
        node.textContent = `Could not load ${includePath}`;
      }
    })
  );
}
