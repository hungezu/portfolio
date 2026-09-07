(() => {
  const paths = {
    check: '<path d="M20 6 9 17l-5-5"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    info: '<path d="M12 16v-4M12 8h.01"/>',
    warning: '<path d="M12 9v4M12 17h.01"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    calendar: '<path d="M8 2v3M16 2v3"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01"/>',
    search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
    trash: '<path d="M10 11v6M14 11v6M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    download: '<path d="M12 15V3M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5"/>',
    'folder-open': '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
  };

  window.gkxIcon = (name, className = 'ui-icon') => {
    const content = paths[name];
    if (!content) return '';
    return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${content}</svg>`;
  };

  const replace = (node, name) => {
    if (!node || node.dataset.gkxIcon === name) return;
    node.innerHTML = window.gkxIcon(name);
    node.dataset.gkxIcon = name;
  };

  window.hydrateGkxIcons = (root = document) => {
    root.querySelectorAll('.mark.do').forEach(node => replace(node, 'check'));
    root.querySelectorAll('.mark.dont,.message-close').forEach(node => replace(node, 'close'));
    root.querySelectorAll('.option-check').forEach(node => replace(node, 'check'));
    root.querySelectorAll('.semantic-icon').forEach(node => {
      const value = node.textContent.trim();
      replace(node, value === '✓' ? 'check' : value === '×' ? 'close' : value === '!' ? 'warning' : 'info');
    });
    root.querySelectorAll('.page-item,.calendar-nav button,.carousel-arrow').forEach(node => {
      const label = node.getAttribute('aria-label') || '';
      const value = node.textContent.trim();
      if (label.includes('上一') || value === '‹') replace(node, 'chevron-left');
      if (label.includes('下一') || value === '›') replace(node, 'chevron-right');
    });
    root.querySelectorAll('.select-trigger>svg,.collapse-trigger>svg').forEach(node => node.outerHTML = window.gkxIcon('chevron-down'));
  };
})();
