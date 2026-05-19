const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const state = {
  mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  cursor: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  reel: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  hero: { x: 0, y: 0, tx: 0, ty: 0, rx: 0, ry: 0, visible: false }
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const cursor = $(".cursor");
const cursorLabel = $(".cursor__label");
const cursorReel = $(".cursor-reel");
const cursorReelVideo = $(".cursor-reel video");
const heroZone = $(".magnet-zone");
const heroCard = $(".hero-card");
const pageWipe = $(".page-wipe");
const pageWipeLabel = $(".page-wipe__label");
const menu = $(".menu");
const navToggle = $(".nav-toggle");

const burstImages = [
  "pexels-blackben-35178054.jpg",
  "pexels-cottonbro-10385223.jpg",
  "pexels-fotios-photos-16129705.jpg",
  "pexels-rdne-7915249.jpg",
  "pexels-theonlyabdulla-33393706.jpg",
  "pexels-yankrukov-9072319.jpg",
  "71caa605-50fb-46c7-9a53-9d0ac2ca7e28.png",
  "cbac8b90-81b2-4530-a070-703b52393184.png"
];

function lerp(from, to, amount) {
  return from + (to - from) * amount;
}

function boot() {
  setTimeout(() => document.body.classList.add("is-loaded"), 420);
  setupClock();
  setupMenu();
  setupPageTransitions();
  setupRevealObserver();
  setupProjectTiles();
  setupCursor();
  setupHeroFollower();
  setupBurstWords();
  setupServiceRows();
  setupMagneticLinks();
  setupGalleryLoop();
}

function setupClock() {
  const clock = $(".clock");
  if (!clock) return;

  const update = () => {
    const time = new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata"
    }).format(new Date());
    clock.textContent = `IST ${time}`;
  };

  update();
  setInterval(update, 30000);
}

function setupMenu() {
  if (!navToggle || !menu) return;

  const closeMenu = () => {
    navToggle.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
    menu.classList.remove("is-open");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    menu.setAttribute("aria-hidden", String(isOpen));
    menu.classList.toggle("is-open", !isOpen);
  });

  $$(".menu a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

function setupPageTransitions() {
  $$("[data-transition]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!hash || !hash.startsWith("#")) return;
      const target = $(hash);
      if (!target || prefersReducedMotion) return;

      event.preventDefault();
      const label = link.dataset.transition || hash.replace("#", "");
      pageWipeLabel.textContent = label;
      pageWipe.classList.remove("is-active");
      void pageWipe.offsetWidth;
      pageWipe.classList.add("is-active");

      setTimeout(() => {
        target.scrollIntoView({ behavior: "instant", block: "start" });
        history.replaceState(null, "", hash);
      }, 390);

      setTimeout(() => {
        pageWipe.classList.remove("is-active");
      }, 1120);
    });
  });
}

function setupRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );

  $$(".reveal-line, .project-tile, .contact").forEach((el) => observer.observe(el));
}

function setupProjectTiles() {
  $$(".project-tile").forEach((tile) => {
    const video = $("video", tile);
    tile.addEventListener("mouseenter", () => {
      video.currentTime = 0;
      video.play().catch(() => {});
      setCursorReel(video.getAttribute("src"));
    });
    tile.addEventListener("mouseleave", () => {
      video.pause();
      hideCursorReel();
    });
    tile.addEventListener("mousemove", (event) => {
      const rect = tile.getBoundingClientRect();
      const rx = ((event.clientY - rect.top) / rect.height - 0.5) * -4;
      const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 4;
      tile.style.transform = `translate3d(0, 0, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    tile.addEventListener("mouseleave", () => {
      tile.style.transform = "";
    });
  });
}

function setupCursor() {
  if (!cursor || prefersReducedMotion) return;

  window.addEventListener("pointermove", (event) => {
    state.mouse.x = event.clientX;
    state.mouse.y = event.clientY;
    cursor.classList.add("is-visible");
  });

  document.addEventListener("pointerleave", () => {
    cursor.classList.remove("is-visible");
  });

  $$("[data-cursor]").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursorLabel.textContent = el.dataset.cursor;
      cursor.classList.add("has-label");
    });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("has-label");
    });
  });

  requestAnimationFrame(animateCursor);
}

function animateCursor() {
  state.cursor.x = lerp(state.cursor.x, state.mouse.x, 0.24);
  state.cursor.y = lerp(state.cursor.y, state.mouse.y, 0.24);
  cursor.style.transform = `translate3d(${state.cursor.x}px, ${state.cursor.y}px, 0)`;

  if (cursorReel) {
    state.reel.x = lerp(state.reel.x, state.mouse.x + 108, 0.12);
    state.reel.y = lerp(state.reel.y, state.mouse.y - 18, 0.12);
    cursorReel.style.transform = `translate3d(${state.reel.x}px, ${state.reel.y}px, 0) translate(-50%, -50%) rotate(-5deg)`;
  }

  if (heroCard) {
    state.hero.x = lerp(state.hero.x, state.hero.tx, 0.14);
    state.hero.y = lerp(state.hero.y, state.hero.ty, 0.14);
    heroCard.style.left = `${state.hero.x}px`;
    heroCard.style.top = `${state.hero.y}px`;
    heroCard.style.transform = `translate3d(-50%, -50%, 0) rotateX(${state.hero.rx}deg) rotateY(${state.hero.ry}deg) scale(${state.hero.visible ? 1 : 0.9})`;
  }

  requestAnimationFrame(animateCursor);
}

function setCursorReel(src) {
  if (!cursorReel || !cursorReelVideo || prefersReducedMotion) return;
  if (src && !cursorReelVideo.src.endsWith(src)) {
    cursorReelVideo.src = src;
  }
  cursorReel.classList.add("is-visible");
  cursorReelVideo.play().catch(() => {});
}

function hideCursorReel() {
  if (!cursorReel || !cursorReelVideo) return;
  cursorReel.classList.remove("is-visible");
  cursorReelVideo.pause();
}

function setupHeroFollower() {
  if (!heroZone || !heroCard || prefersReducedMotion) return;

  heroZone.addEventListener("pointermove", (event) => {
    const rect = heroZone.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const speedX = event.movementX || 0;
    const speedY = event.movementY || 0;

    state.hero.tx = localX;
    state.hero.ty = localY;
    state.hero.ry = Math.max(-18, Math.min(18, speedX * 1.2));
    state.hero.rx = Math.max(-18, Math.min(18, -speedY * 1.2));
    state.hero.visible = true;
    heroCard.classList.add("is-visible");

    window.clearTimeout(heroCard.resetTimer);
    heroCard.resetTimer = window.setTimeout(() => {
      state.hero.rx = 0;
      state.hero.ry = 0;
    }, 90);
  });

  heroZone.addEventListener("pointerleave", () => {
    state.hero.visible = false;
    heroCard.classList.remove("is-visible");
  });
}

function setupBurstWords() {
  $$(".burst-word").forEach((word) => {
    let timer = null;

    const spawn = () => {
      const rect = word.getBoundingClientRect();
      const card = document.createElement("span");
      const image = document.createElement("img");
      const x = rect.left + rect.width / 2 + window.scrollX + random(-70, 70);
      const y = rect.top + rect.height / 2 + window.scrollY + random(-38, 38);

      image.src = burstImages[Math.floor(Math.random() * burstImages.length)];
      image.alt = "";
      card.className = "burst-card";
      card.style.left = `${x}px`;
      card.style.top = `${y}px`;
      card.style.setProperty("--rot", `${random(-9, 9)}deg`);
      card.appendChild(image);
      document.body.appendChild(card);
      card.addEventListener("animationend", () => card.remove(), { once: true });
    };

    word.addEventListener("mouseenter", () => {
      spawn();
      timer = window.setInterval(spawn, 190);
    });

    word.addEventListener("mouseleave", () => {
      window.clearInterval(timer);
    });
  });
}

function setupServiceRows() {
  $$(".service-row").forEach((row) => {
    row.addEventListener("pointermove", (event) => {
      const rect = row.getBoundingClientRect();
      row.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      row.style.setProperty("--my", `${event.clientY - rect.top}px`);
      row.classList.add("is-hot");
    });

    row.addEventListener("pointerleave", () => {
      row.classList.remove("is-hot");
    });
  });
}

function setupMagneticLinks() {
  if (prefersReducedMotion) return;

  $$(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.35;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });

    el.addEventListener("pointerleave", () => {
      el.style.transform = "translate3d(0, 0, 0)";
    });
  });
}

function setupGalleryLoop() {
  const strip = $(".gallery-strip");
  if (!strip) return;
  strip.innerHTML += strip.innerHTML;
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
