interface ImageAccordionData {
  image: string;
  title: string;
  description: string;
  link: string;
}

/**
 * Initialize an image accordion component
 * @param selector CSS selector for the container element
 * @param data Array of image accordion data objects
 * @returns Cleanup function to remove event listeners
 */
export function initImageAccordion(selector: string, data: ImageAccordionData[]): () => void {
  const container = document.querySelector(selector);
  if (!container) {
    console.error('ImageAccordion: Container not found for selector:', selector);
    return () => {};
  }

  // Clear container
  container.innerHTML = '';

  // Create accordion container
  const accordionContainer = document.createElement('div');
  accordionContainer.className = 'image-accordion-container';

  // Create panels
  data.forEach((item, index) => {
    const panel = document.createElement('div');
    panel.className = 'image-accordion-panel';
    panel.setAttribute('data-index', index.toString());
    panel.tabIndex = 0; /* Make panel focusable for keyboard navigation */

    // Background image
    const imageDiv = document.createElement('div');
    imageDiv.className = 'panel-image';
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.title;
    imageDiv.appendChild(img);

    // Overlay card
    const overlay = document.createElement('div');
    overlay.className = 'panel-overlay';

    // Magnifier icon (optional)
    const magnifier = document.createElement('span');
    magnifier.className = 'panel-magnifier';
    magnifier.innerHTML = '🔍';
    overlay.appendChild(magnifier);

    // Title
    const title = document.createElement('h3');
    title.textContent = item.title;
    overlay.appendChild(title);

    // Description
    const description = document.createElement('p');
    description.textContent = item.description;
    overlay.appendChild(description);

    // CTA button
    const ctaButton = document.createElement('a');
    ctaButton.href = item.link;
    ctaButton.className = 'panel-cta';
    ctaButton.textContent = 'Read More';
    overlay.appendChild(ctaButton);

    // Append elements to panel
    panel.appendChild(imageDiv);
    panel.appendChild(overlay);

    // Append panel to container
    accordionContainer.appendChild(panel);
  });

  // Add accordion container to main container
  container.appendChild(accordionContainer);

  // Add event listeners for hover interactions
  const panels = accordionContainer.querySelectorAll('.image-accordion-panel');
  let hoverTimeout: number | null = null;
  let expandedIndex: number | null = null;

  // Set initial state: first panel expanded
  if (panels.length > 0) {
    panels[0].classList.add('expanded');
    expandedIndex = 0;
  }

  // Store handlers for proper cleanup
  const mouseEnterHandlers = new Map<Element, () => void>();
  const mouseLeaveHandlers = new Map<Element, () => void>;
  const clickHandlers = new Map<Element, (e: Event) => void>();

  panels.forEach((panel, index) => {
    const handleMouseEnter = () => {
      if (hoverTimeout !== null) {
        clearTimeout(hoverTimeout);
      }

      hoverTimeout = window.setTimeout(() => {
        // Remove expanded class from all panels
        panels.forEach(p => p.classList.remove('expanded'));

        // Add expanded class to hovered panel
        panel.classList.add('expanded');
        expandedIndex = index;
      }, 100); // 100ms delay to prevent accidental triggers
    };

    const handleMouseLeave = () => {
      if (hoverTimeout !== null) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }

      // Only collapse if not clicked (click takes precedence)
      if (expandedIndex !== index) {
        panel.classList.remove('expanded');
      }
    };

    const handleClick = (e: Event) => {
      e.preventDefault();

      if (hoverTimeout !== null) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }

      // Toggle expanded state
      if (panel.classList.contains('expanded')) {
        panel.classList.remove('expanded');
        expandedIndex = null;
      } else {
        // Remove expanded class from all panels
        panels.forEach(p => p.classList.remove('expanded'));

        // Add expanded class to clicked panel
        panel.classList.add('expanded');
        expandedIndex = index;
      }
    };

    // Store handlers for cleanup
    mouseEnterHandlers.set(panel, handleMouseEnter);
    mouseLeaveHandlers.set(panel, handleMouseLeave);
    clickHandlers.set(panel, handleClick);

    // Add event listeners
    panel.addEventListener('mouseenter', handleMouseEnter);
    panel.addEventListener('mouseleave', handleMouseLeave);
    panel.addEventListener('click', handleClick);
  });

  // Add cleanup function to prevent memory leaks
  return () => {
    if (hoverTimeout !== null) {
      clearTimeout(hoverTimeout);
    }

    panels.forEach(panel => {
      const mouseEnterHandler = mouseEnterHandlers.get(panel);
      const mouseLeaveHandler = mouseLeaveHandlers.get(panel);
      const clickHandler = clickHandlers.get(panel);

      if (mouseEnterHandler !== undefined) {
        panel.removeEventListener('mouseenter', mouseEnterHandler);
      }
      if (mouseLeaveHandler !== undefined) {
        panel.removeEventListener('mouseleave', mouseLeaveHandler);
      }
      if (clickHandler !== undefined) {
        panel.removeEventListener('click', clickHandler);
      }
    });
  };
}