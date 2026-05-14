// DIPLAT IR Deck — horizontal scroll-snap carousel
(() => {
  const deck    = document.getElementById('deck');
  const slides  = Array.from(deck.querySelectorAll('.slide'));
  const total   = slides.length;
  const cur     = document.getElementById('cur');
  const tot     = document.getElementById('total');
  const prev    = document.getElementById('prev');
  const next    = document.getElementById('next');
  const print   = document.getElementById('print');
  const eprev   = document.getElementById('edgePrev');
  const enext   = document.getElementById('edgeNext');
  const progress= document.getElementById('progress');

  tot.textContent = total;

  const goTo = (i) => {
    const idx = Math.max(0, Math.min(total - 1, i));
    slides[idx].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  };

  // Detect active slide based on horizontal scroll
  const updateActive = () => {
    const w = window.innerWidth;
    if (w === 0) return 0;
    const idx = Math.round(deck.scrollLeft / w);
    const clamped = Math.max(0, Math.min(total - 1, idx));
    cur.textContent = clamped + 1;
    if (progress) progress.style.width = ((clamped + 1) / total * 100) + '%';
    return clamped;
  };

  // Keyboard
  document.addEventListener('keydown', (e) => {
    const a = updateActive();
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault(); goTo(a + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'ArrowUp') {
      e.preventDefault(); goTo(a - 1);
    } else if (e.key === 'Home') {
      e.preventDefault(); goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault(); goTo(total - 1);
    }
  });

  // Vertical wheel → horizontal navigation (one slide per gesture)
  let wheelLock = false;
  deck.addEventListener('wheel', (e) => {
    // Prefer horizontal delta if user is using a touchpad gesture
    const dx = Math.abs(e.deltaX);
    const dy = Math.abs(e.deltaY);
    const dom = dx > dy ? e.deltaX : e.deltaY;
    if (Math.abs(dom) < 8) return;
    e.preventDefault();
    if (wheelLock) return;
    wheelLock = true;
    const a = updateActive();
    goTo(a + (dom > 0 ? 1 : -1));
    setTimeout(() => { wheelLock = false; }, 480);
  }, { passive: false });

  // Touch swipe
  let touchX = null, touchY = null;
  deck.addEventListener('touchstart', (e) => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: true });
  deck.addEventListener('touchend', (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      goTo(updateActive() + (dx < 0 ? 1 : -1));
    }
    touchX = touchY = null;
  }, { passive: true });

  // Buttons & edges
  const wireNext = (el) => el && el.addEventListener('click', () => goTo(updateActive() + 1));
  const wirePrev = (el) => el && el.addEventListener('click', () => goTo(updateActive() - 1));
  wirePrev(prev);  wireNext(next);
  wirePrev(eprev); wireNext(enext);
  print.addEventListener('click', () => window.print());

  // Live progress on scroll
  let ticking = false;
  deck.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { updateActive(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  // Re-snap on resize so the active slide stays aligned
  window.addEventListener('resize', () => {
    const a = parseInt(cur.textContent, 10) - 1 || 0;
    deck.scrollTo({ left: a * window.innerWidth, behavior: 'instant' in window ? 'instant' : 'auto' });
    updateActive();
  });

  updateActive();
})();
