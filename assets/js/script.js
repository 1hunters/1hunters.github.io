(function () {
  'use strict';

  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

  function getStoredTheme() {
    try {
      return localStorage.getItem('theme');
    } catch (error) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      // The selected theme still applies for this page view.
    }
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    root.dataset.theme = theme;
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      themeToggle.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    }
    if (themeColor) {
      themeColor.setAttribute('content', isDark ? '#101920' : '#f4f7f9');
    }
  }

  applyTheme(root.dataset.theme || (systemTheme.matches ? 'dark' : 'light'));

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      storeTheme(nextTheme);
    });
  }

  function handleSystemThemeChange(event) {
    if (!getStoredTheme()) {
      applyTheme(event.matches ? 'dark' : 'light');
    }
  }

  if (typeof systemTheme.addEventListener === 'function') {
    systemTheme.addEventListener('change', handleSystemThemeChange);
  } else if (typeof systemTheme.addListener === 'function') {
    systemTheme.addListener(handleSystemThemeChange);
  }

  const navToggle = document.getElementById('nav-toggle');
  const navigation = document.getElementById('primary-navigation');

  function setMenu(open) {
    if (!navToggle || !navigation) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  }

  if (navToggle && navigation) {
    navToggle.addEventListener('click', function () {
      setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    navigation.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('click', function (event) {
      if (!navigation.contains(event.target) && !navToggle.contains(event.target)) {
        setMenu(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        navToggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) setMenu(false);
    });
  }

  const navLinks = Array.from(document.querySelectorAll('.section-nav-links a[href^="#"]'));
  const observedSections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && observedSections.length) {
    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          const isActive = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('is-active', isActive);
          if (isActive) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-18% 0px -72% 0px', threshold: 0 });

    observedSections.forEach(function (section) { sectionObserver.observe(section); });
  }

  const paperList = document.getElementById('paperList');
  const sortButtons = Array.from(document.querySelectorAll('[data-sort]'));

  function enhancePaper(item) {
    const paper = item.querySelector('.paper');
    if (!paper) return;

    const title = paper.querySelector(':scope > strong:first-child');
    const titleText = title ? title.textContent.trim() : 'publication';
    const venue = paper.querySelector(':scope > .venue');

    if (venue && venue.firstChild && venue.firstChild.nodeType === Node.TEXT_NODE) {
      const labelMatch = venue.firstChild.nodeValue.match(/^\s*\[([^\]]+)\]\s*/);
      if (labelMatch) {
        const label = document.createElement('span');
        label.className = 'venue-label';
        label.textContent = labelMatch[1];
        venue.firstChild.nodeValue = venue.firstChild.nodeValue.replace(labelMatch[0], '');
        venue.insertBefore(label, venue.firstChild);
      }
    }

    const actionLinks = Array.from(paper.children).filter(function (element) {
      return element.tagName === 'A';
    });

    if (!actionLinks.length) return;

    Array.from(paper.childNodes).forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.nodeValue = node.nodeValue.replace(/[\[\]]/g, ' ');
      }
    });

    const actions = document.createElement('span');
    actions.className = 'paper-actions';
    actionLinks.forEach(function (link) {
      const label = link.textContent.trim();
      link.setAttribute('aria-label', label + ': ' + titleText);
      actions.appendChild(link);
    });
    paper.appendChild(actions);
  }

  if (paperList) {
    const originalOrder = Array.from(paperList.children);
    originalOrder.forEach(enhancePaper);

    function sortPapers(criteria) {
      const sorted = originalOrder.slice().sort(function (a, b) {
        const yearDifference = Number(b.dataset.year) - Number(a.dataset.year);
        if (criteria === 'author') {
          const authorDifference = Number(a.getAttribute('paper-weighting')) - Number(b.getAttribute('paper-weighting'));
          if (authorDifference !== 0) return authorDifference;
        }
        if (yearDifference !== 0) return yearDifference;
        return originalOrder.indexOf(a) - originalOrder.indexOf(b);
      });

      sorted.forEach(function (paper) { paperList.appendChild(paper); });
      sortButtons.forEach(function (button) {
        const isActive = button.dataset.sort === criteria;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
    }

    sortButtons.forEach(function (button) {
      button.addEventListener('click', function () { sortPapers(button.dataset.sort); });
    });

    sortPapers('year');
  }
}());
