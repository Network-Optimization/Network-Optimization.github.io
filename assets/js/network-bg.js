(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 768px)').matches;

  function initReveal() {
    var targets = document.querySelectorAll(
      '.page__content h2, .page__content .edu-entry, .sidebar .profile_box'
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
      targets[j].style.transitionDelay = Math.min(j * 0.06, 0.36) + 's';
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
    }, { threshold: 0.1, rootMargin: '0px 0px -4% 0px' });

    for (var m = 0; m < targets.length; m++) {
      observer.observe(targets[m]);
    }
  }

  function initNetwork() {
    var canvas = document.getElementById('network-canvas');
    if (!canvas || prefersReducedMotion) return;

    var ctx = canvas.getContext('2d');
    var width = 0;
    var height = 0;
    var particles = [];
    var animationId = 0;
    var mouse = { x: 0, y: 0, active: false };
    var count = isMobile ? 26 : 50;
    var linkDistance = isMobile ? 88 : 128;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: 1 + Math.random() * 1.1
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;

        if (mouse.active) {
          var dx = p.x - mouse.x;
          var dy = p.y - mouse.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130 && dist > 0) {
            var force = ((130 - dist) / 130) * 0.45;
            p.vx += (dx / dist) * force * 0.018;
            p.vy += (dy / dist) * force * 0.018;
          }
        }

        p.vx *= 0.992;
        p.vy *= 0.992;

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var lx = p.x - q.x;
          var ly = p.y - q.y;
          var lineDist = Math.sqrt(lx * lx + ly * ly);
          if (lineDist < linkDistance) {
            var alpha = (1 - lineDist / linkDistance) * 0.16;
            ctx.strokeStyle = 'rgba(34, 75, 141, ' + alpha + ')';
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 75, 141, 0.32)';
        ctx.fill();
      }

      animationId = window.requestAnimationFrame(draw);
    }

    function onResize() {
      resize();
      createParticles();
    }

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    }, { passive: true });
    window.addEventListener('mouseleave', function () {
      mouse.active = false;
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        window.cancelAnimationFrame(animationId);
      } else {
        draw();
      }
    });

    onResize();
    draw();
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initReveal();
      initNetwork();
      initMasthead();
    });
  } else {
    initReveal();
    initNetwork();
    initMasthead();
  }
})();
