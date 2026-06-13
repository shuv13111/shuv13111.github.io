// SIGNAL — motion & interactions
// IntersectionObserver reveals, metric count-ups, nav state.
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll reveals ---------- */
  var revealEls = document.querySelectorAll('.io-reveal');
  if (prefersReduced) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
          setTimeout(function () { el.classList.add('in'); }, delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Metric count-ups ----------
     <span class="count" data-prefix="" data-target="18" data-suffix="M"> */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = (el.getAttribute('data-target').split('.')[1] || '').length;
    var dur = 1100;
    var start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var counts = document.querySelectorAll('.count');
  if (prefersReduced) {
    counts.forEach(function (el) {
      el.textContent = (el.getAttribute('data-prefix') || '') + el.getAttribute('data-target') + (el.getAttribute('data-suffix') || '');
    });
  } else {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counts.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Active nav link ---------- */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (sections.length && navLinks.length) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) {
            a.style.color = a.getAttribute('href') === '#' + entry.target.id ? 'var(--accent)' : '';
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { nio.observe(s); });
  }

  /* ---------- Project rows are fully clickable ---------- */
  document.querySelectorAll('.project-row[data-href]').forEach(function (row) {
    row.style.cursor = 'pointer';
    row.setAttribute('role', 'link');
    row.setAttribute('tabindex', '0');

    function openProject() {
      var href = row.getAttribute('data-href');
      if (href.indexOf('http') === 0) window.open(href, '_blank');
      else window.location.href = href;
    }

    row.addEventListener('click', openProject);
    row.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openProject();
      }
    });
  });

  /* ---------- Learn module selector ---------- */
  var learnModal = document.getElementById('learn-modal');
  var lastLearnTrigger = null;

  function openLearnModal(trigger) {
    if (!learnModal) return;
    lastLearnTrigger = trigger;
    learnModal.classList.add('is-open');
    learnModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    var firstOption = learnModal.querySelector('.learn-option');
    if (firstOption) firstOption.focus();
  }

  function closeLearnModal() {
    if (!learnModal) return;
    learnModal.classList.remove('is-open');
    learnModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (lastLearnTrigger) lastLearnTrigger.focus();
  }

  document.querySelectorAll('[data-open-learn]').forEach(function (button) {
    button.addEventListener('click', function () {
      openLearnModal(button);
    });
  });

  document.querySelectorAll('[data-close-learn]').forEach(function (button) {
    button.addEventListener('click', closeLearnModal);
  });

  document.querySelectorAll('[data-learn-href]').forEach(function (button) {
    button.addEventListener('click', function () {
      var href = button.getAttribute('data-learn-href');
      if (href) window.open(href, '_blank', 'noopener,noreferrer');
      closeLearnModal();
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && learnModal && learnModal.classList.contains('is-open')) {
      closeLearnModal();
    }
  });

  /* ---------- Interactive architecture diagram ---------- */
  var archNodes = document.querySelectorAll('.arch-node[data-arch-title]');
  var archDetail = document.querySelector('.arch-detail');
  if (archNodes.length && archDetail) {
    var detailKicker = archDetail.querySelector('.arch-detail-kicker');
    var detailTitle = archDetail.querySelector('h4');
    var detailBody = archDetail.querySelector('p');
    var detailStack = archDetail.querySelector('.arch-detail-stack');

    function setArchDetail(node) {
      archNodes.forEach(function (item) {
        var active = item === node;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      detailKicker.textContent = node.getAttribute('data-arch-kicker') || '';
      detailTitle.textContent = node.getAttribute('data-arch-title') || '';
      detailBody.textContent = node.getAttribute('data-arch-body') || '';
      detailStack.innerHTML = '';

      (node.getAttribute('data-arch-stack') || '').split('|').forEach(function (item) {
        if (!item) return;
        var chip = document.createElement('span');
        chip.textContent = item;
        detailStack.appendChild(chip);
      });
    }

    archNodes.forEach(function (node) {
      node.addEventListener('click', function () {
        setArchDetail(node);
      });
    });
  }
})();
