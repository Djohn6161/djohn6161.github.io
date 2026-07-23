const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initHeaderScroll() {
  const header = document.getElementById('header');
  const progress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');
  if (!header || !progress || !backToTop) return;

  function onScroll() {
    const scrollY = window.scrollY;
    header.classList.toggle('is-scrolled', scrollY > 40);
    backToTop.classList.toggle('is-visible', scrollY > 600);
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    progress.style.width = pct + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (!toggle || !mobileNav) return;

  function closeNav() {
    toggle.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('is-open');
    document.body.classList.remove('nav-open');
  }
  toggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('nav-open', isOpen);
  });
  mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });
}

function initScrollSpy() {
  const sections = document.querySelectorAll('main section[id]');
  const links = document.querySelectorAll('.nav__link');
  if (!sections.length || !links.length) return;

  const map = new Map();
  links.forEach((link) => map.set(link.getAttribute('href').slice(1), link));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = map.get(entry.target.id);
        if (!link || !entry.isIntersecting) return;
        links.forEach((l) => {
          l.classList.remove('is-active');
          l.removeAttribute('aria-current');
        });
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'true');
      });
    },
    { rootMargin: '-45% 0px -45% 0px' }
  );
  sections.forEach((s) => observer.observe(s));
}

function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((item, i) => {
    item.style.transitionDelay = reduceMotion ? '0ms' : `${Math.min(i % 6, 5) * 60}ms`;
    observer.observe(item);
  });
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        observer.unobserve(el);

        if (reduceMotion) {
          el.textContent = target;
          return;
        }

        const duration = 1200;
        const startTime = performance.now();
        function step(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target);
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((c) => observer.observe(c));
}

function initRoleCycler() {
  const el = document.getElementById('roleText');
  if (!el) return;
  const roles = ['Software Developer', 'PHP & Laravel Engineer', 'Python Data Specialist', 'Systems Builder'];

  if (reduceMotion) {
    el.textContent = roles[0];
    return;
  }

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const current = roles[roleIndex];
    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
      setTimeout(tick, 65);
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 35);
    }
  }
  setTimeout(tick, 1200);
}

function initTerminal() {
  const body = document.getElementById('terminalBody');
  if (!body) return;

  const lines = [
    { cmd: 'whoami', out: 'Don John Daryl Curativo — Software Developer' },
    { cmd: 'cat stack.txt', out: 'PHP · Laravel · Python · MySQL · JavaScript' },
    { cmd: './status.sh', out: 'Building internal systems @ Biggs Inc. since 2024' },
  ];

  if (reduceMotion) return;

  body.innerHTML = '';
  let lineIndex = 0;

  function typeLine() {
    if (lineIndex >= lines.length) {
      const cursor = document.createElement('span');
      cursor.className = 'terminal__cursor';
      body.appendChild(cursor);
      return;
    }
    const { cmd, out } = lines[lineIndex];
    const lineEl = document.createElement('div');
    lineEl.className = 'terminal__line';
    const promptEl = document.createElement('span');
    promptEl.className = 'terminal__prompt';
    promptEl.textContent = '$';
    const cmdEl = document.createElement('span');
    lineEl.appendChild(promptEl);
    lineEl.appendChild(document.createTextNode(' '));
    lineEl.appendChild(cmdEl);
    body.appendChild(lineEl);

    let charIndex = 0;
    const typeInterval = setInterval(() => {
      cmdEl.textContent += cmd[charIndex];
      charIndex++;
      if (charIndex >= cmd.length) {
        clearInterval(typeInterval);
        setTimeout(() => {
          const outEl = document.createElement('div');
          outEl.className = 'terminal__output';
          outEl.textContent = out;
          body.appendChild(outEl);
          lineIndex++;
          setTimeout(typeLine, 400);
        }, 200);
      }
    }, 35);
  }
  setTimeout(typeLine, 500);
}

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

function initCopyEmail() {
  const btn = document.getElementById('copyEmailBtn');
  if (!btn) return;
  const original = btn.textContent;
  btn.addEventListener('click', async () => {
    const email = btn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      btn.textContent = 'Copied!';
      btn.classList.add('is-copied');
    } catch (err) {
      window.location.href = 'mailto:' + email;
      return;
    }
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('is-copied');
    }, 1800);
  });
}

function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (!isFinePointer || reduceMotion) {
    glow.style.display = 'none';
    return;
  }
  window.addEventListener(
    'mousemove',
    (e) => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    },
    { passive: true }
  );
}

function initTilt() {
  const cards = document.querySelectorAll('.project-card');
  if (!cards.length) return;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (!isFinePointer || reduceMotion) return;

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  initScrollSpy();
  initReveal();
  initCounters();
  initRoleCycler();
  initTerminal();
  initBackToTop();
  initCopyEmail();
  initCursorGlow();
  initTilt();
  initYear();
});
