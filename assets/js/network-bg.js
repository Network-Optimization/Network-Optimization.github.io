(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initReveal() {
    var targets = document.querySelectorAll(
      '.page__content h2, .page__content .edu-entry, .sidebar .profile_box, .news-item, .pub-list > ul > li'
    );
    if (!targets.length) return;

    if (prefersReducedMotion) {
      for (var i = 0; i < targets.length; i++) {
        targets[i].classList.add('is-visible');
      }
      return;
    }

    for (var j = 0; j < targets.length; j++) {
      targets[j].classList.add('reveal-item');
      targets[j].style.transitionDelay = Math.min(j * 0.05, 0.3) + 's';
    }

    if (!('IntersectionObserver' in window)) {
      for (var k = 0; k < targets.length; k++) {
        targets[k].classList.add('is-visible');
      }
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

    for (var m = 0; m < targets.length; m++) {
      observer.observe(targets[m]);
    }
  }

  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    function onScroll() {
      btn.classList.toggle('is-visible', window.scrollY > 420);
    }

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initMasthead() {
    var masthead = document.querySelector('.masthead');
    if (!masthead) return;

    function onScroll() {
      masthead.classList.toggle('is-scrolled', window.scrollY > 10);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function init() {
    initReveal();
    initBackToTop();
    initMasthead();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
