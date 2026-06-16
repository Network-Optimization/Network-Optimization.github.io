(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 768px)').matches;
  var mouse = {
    x: 0,
    y: 0,
    smoothX: 0,
    smoothY: 0,
    active: false
  };

  function lerp(start, end, amount) {
    return start + (end - start) * amount;
  }

  function updateMouseSmooth() {
    mouse.smoothX = lerp(mouse.smoothX, mouse.x, 0.14);
    mouse.smoothY = lerp(mouse.smoothY, mouse.y, 0.14);
  }

  function bindMouseTracking() {
    if (prefersReducedMotion || isMobile) return;

    mouse.x = window.innerWidth * 0.5;
    mouse.y = window.innerHeight * 0.5;
    mouse.smoothX = mouse.x;
    mouse.smoothY = mouse.y;

    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!mouse.active) {
        mouse.active = true;
        mouse.smoothX = e.clientX;
        mouse.smoothY = e.clientY;
        document.body.classList.add('is-mouse-active');
      }
    }, { passive: true });

    window.addEventListener('mouseleave', function () {
      mouse.active = false;
      document.body.classList.remove('is-mouse-active');
    });
  }

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

  function initMouseEffects() {
    if (prefersReducedMotion || isMobile) return;

    var glow = document.getElementById('mouse-glow');
    var ambient = document.querySelector('.ambient-bg');
    var hero = document.querySelector('.page-hero');
    var profile = document.querySelector('.sidebar .profile_box');
    var mesh = document.querySelector('.bg-mesh');

    function tick() {
      updateMouseSmooth();

      if (glow) {
        glow.style.transform = 'translate3d(' + mouse.smoothX + 'px,' + mouse.smoothY + 'px,0)';
      }

      if (ambient) {
        var nx = mouse.smoothX / window.innerWidth - 0.5;
        var ny = mouse.smoothY / window.innerHeight - 0.5;
        ambient.style.transform =
          'translate3d(' + (nx * 36) + 'px,' + (ny * 28) + 'px,0)';
      }

      if (mesh) {
        var mx = mouse.smoothX / window.innerWidth - 0.5;
        var my = mouse.smoothY / window.innerHeight - 0.5;
        mesh.style.transform =
          'translate3d(' + (mx * -12) + 'px,' + (my * -10) + 'px,0) scale(1.02)';
      }

      if (hero && mouse.active) {
        var hx = mouse.smoothX / window.innerWidth - 0.5;
        var hy = mouse.smoothY / window.innerHeight - 0.5;
        hero.style.transform =
          'perspective(900px) rotateX(' + (hy * -3.5) + 'deg) rotateY(' + (hx * 3.5) + 'deg)';
      } else if (hero) {
        hero.style.transform = '';
      }

      if (profile && mouse.active) {
        var px = mouse.smoothX / window.innerWidth - 0.5;
        profile.style.transform = 'translate3d(' + (px * 6) + 'px,0,0)';
      } else if (profile) {
        profile.style.transform = '';
      }

      window.requestAnimationFrame(tick);
    }

    tick();
  }

  function initNetwork() {
    var canvas = document.getElementById('network-canvas');
    if (!canvas || prefersReducedMotion) return;

    var ctx = canvas.getContext('2d');
    var width = 0;
    var height = 0;
    var particles = [];
    var pulses = [];
    var links = [];
    var animationId = 0;
    var frame = 0;
    var time = 0;
    var count = isMobile ? 40 : 82;
    var linkDistance = isMobile ? 105 : 158;
    var mouseRadius = isMobile ? 130 : 230;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      for (var i = 0; i < count; i++) {
        var isHub = !isMobile && i < 8;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (isHub ? 0.14 : 0.28),
          vy: (Math.random() - 0.5) * (isHub ? 0.14 : 0.28),
          r: isHub ? 2.4 + Math.random() * 1.2 : 1.3 + Math.random() * 1.5,
          hub: isHub,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    function drawBackdrop() {
      var g = ctx.createRadialGradient(
        width * 0.5, height * 0.42, 0,
        width * 0.5, height * 0.42, Math.max(width, height) * 0.75
      );
      g.addColorStop(0, 'rgba(99, 179, 237, 0.07)');
      g.addColorStop(0.45, 'rgba(34, 75, 141, 0.04)');
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    }

    function collectLinks() {
      links = [];
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var p = particles[i];
          var q = particles[j];
          var lx = p.x - q.x;
          var ly = p.y - q.y;
          var dist = Math.sqrt(lx * lx + ly * ly);
          if (dist < linkDistance) {
            links.push({ x1: p.x, y1: p.y, x2: q.x, y2: q.y, dist: dist });
          }
        }
      }
    }

    function maybeSpawnPulse() {
      if (!links.length || Math.random() > 0.045) return;
      var link = links[Math.floor(Math.random() * links.length)];
      if (Math.random() > 0.5) {
        pulses.push({ x1: link.x1, y1: link.y1, x2: link.x2, y2: link.y2, t: 0 });
      } else {
        pulses.push({ x1: link.x2, y1: link.y2, x2: link.x1, y2: link.y1, t: 0 });
      }
      if (pulses.length > 28) pulses.shift();
    }

    function drawPulses() {
      for (var pi = pulses.length - 1; pi >= 0; pi--) {
        var pulse = pulses[pi];
        pulse.t += 0.014;
        if (pulse.t > 1) {
          pulses.splice(pi, 1);
          continue;
        }
        var x = pulse.x1 + (pulse.x2 - pulse.x1) * pulse.t;
        var y = pulse.y1 + (pulse.y2 - pulse.y1) * pulse.t;
        var glow = ctx.createRadialGradient(x, y, 0, x, y, 10);
        glow.addColorStop(0, 'rgba(140, 210, 255, 0.9)');
        glow.addColorStop(0.4, 'rgba(72, 160, 220, 0.35)');
        glow.addColorStop(1, 'rgba(34, 75, 141, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();
      }
    }

    function drawMouseSpotlight() {
      var mx = mouse.active ? mouse.smoothX : width * 0.5 + Math.sin(time * 0.0004) * 80;
      var my = mouse.active ? mouse.smoothY : height * 0.35 + Math.cos(time * 0.00035) * 60;
      var radius = mouseRadius + 60;
      var gradient = ctx.createRadialGradient(mx, my, 0, mx, my, radius);
      gradient.addColorStop(0, 'rgba(99, 179, 237, 0.14)');
      gradient.addColorStop(0.4, 'rgba(34, 75, 141, 0.06)');
      gradient.addColorStop(1, 'rgba(34, 75, 141, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mx, my, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawMouseLinks() {
      if (!mouse.active) return;

      var mx = mouse.smoothX;
      var my = mouse.smoothY;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var dx = p.x - mx;
        var dy = p.y - my;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseRadius) {
          var alpha = (1 - dist / mouseRadius) * 0.55;
          ctx.strokeStyle = 'rgba(99, 179, 237, ' + alpha + ')';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.arc(mx, my, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(72, 160, 220, 0.65)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx, my, 12, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(140, 210, 255, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    function draw() {
      frame += 1;
      time += 16;
      updateMouseSmooth();
      ctx.clearRect(0, 0, width, height);
      drawBackdrop();
      drawMouseSpotlight();
      collectLinks();
      maybeSpawnPulse();

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;

        if (mouse.active) {
          var dx = p.x - mouse.smoothX;
          var dy = p.y - mouse.smoothY;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRadius && dist > 0) {
            var force = ((mouseRadius - dist) / mouseRadius) * 0.8;
            p.vx += (dx / dist) * force * 0.03;
            p.vy += (dy / dist) * force * 0.03;
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
            var alpha = (1 - lineDist / linkDistance) * 0.5;
            ctx.strokeStyle = 'rgba(72, 160, 220, ' + alpha + ')';
            ctx.lineWidth = p.hub || q.hub ? 1.25 : 0.9;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        var pulse = p.hub ? 0.14 + Math.sin(time * 0.003 + p.phase) * 0.08 : 0;
        var pr = p.r + pulse;
        if (p.hub) {
          var hubGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pr * 5);
          hubGlow.addColorStop(0, 'rgba(140, 210, 255, 0.35)');
          hubGlow.addColorStop(1, 'rgba(34, 75, 141, 0)');
          ctx.fillStyle = hubGlow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, pr * 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, pr, 0, Math.PI * 2);
        ctx.fillStyle = p.hub ? 'rgba(34, 75, 141, 0.75)' : 'rgba(34, 75, 141, 0.62)';
        ctx.fill();
      }

      drawPulses();
      drawMouseLinks();
      animationId = window.requestAnimationFrame(draw);
    }

    function onResize() {
      resize();
      createParticles();
    }

    window.addEventListener('resize', onResize);

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

  function initPeekEyes() {
    if (prefersReducedMotion || isMobile) return;

    var widget = document.getElementById('peek-eyes');
    if (!widget) return;

    var pupils = widget.querySelectorAll('.peek-eyes__pupil');
    var eyes = widget.querySelectorAll('.peek-eyes__eye');
    if (!pupils.length || !eyes.length) return;

    var pupilState = [];
    for (var i = 0; i < pupils.length; i++) {
      pupilState.push({ x: 0, y: 0 });
    }

    var maxOffset = 7;

    function updateEyes() {
      for (var j = 0; j < eyes.length; j++) {
        var eye = eyes[j];
        var pupil = pupils[j];
        var rect = eye.getBoundingClientRect();
        var cx = rect.left + rect.width * 0.5;
        var cy = rect.top + rect.height * 0.5;
        var dx = mouse.smoothX - cx;
        var dy = mouse.smoothY - cy;
        var len = Math.sqrt(dx * dx + dy * dy) || 1;
        var pull = Math.min(maxOffset, len * 0.09);
        var targetX = (dx / len) * pull;
        var targetY = (dy / len) * pull;

        pupilState[j].x = lerp(pupilState[j].x, targetX, 0.18);
        pupilState[j].y = lerp(pupilState[j].y, targetY, 0.18);
        pupil.style.transform =
          'translate3d(' + pupilState[j].x + 'px,' + pupilState[j].y + 'px,0)';
      }

      window.requestAnimationFrame(updateEyes);
    }

    updateEyes();
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
    bindMouseTracking();
    initReveal();
    initNetwork();
    initMouseEffects();
    initPeekEyes();
    initBackToTop();
    initMasthead();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
