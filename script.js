const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const siteHeader = document.querySelector(".site-header");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const modalBackdrop = document.querySelector(".modal-backdrop");
const modalTitle = document.querySelector("#systems-modal-title");
const modalList = document.querySelector(".modal-system-list");
const modalClose = document.querySelector(".modal-close");
const videoModalBackdrop = document.querySelector(".video-modal-backdrop");
const videoModalTitle = document.querySelector("#video-modal-title");
const videoModalFrame = document.querySelector(".video-modal-frame");
const videoModalClose = document.querySelector(".video-modal-close");
const projectTriggers = document.querySelectorAll(".project-open");
const systemTriggers = document.querySelectorAll(".system-trigger");
const modeButtons = document.querySelectorAll("[data-portfolio-mode]");
const modeSwitches = document.querySelectorAll(".mode-switch");
const heroTitle = document.querySelector(".hero-title");
const heroSubtitle = document.querySelector(".hero-subtitle");
const heroText = document.querySelector(".hero-text");
const heroWorkLink = document.querySelector(".hero-work-link");
const pathStatus = document.querySelector(".path-status");
const contactNavNumber = document.querySelector(".nav-cta span");
const themeToggle = document.querySelector(".theme-toggle");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let headerAnimationFrame = 0;
let headerResizeAnimation = null;
let modeTransitionTimeout = 0;
let entryTransitionTimeout = 0;
let scrollAnimationFrame = 0;
let scrollSettleTimeout = 0;
let animatedScrollActive = false;

const applyTheme = (theme) => {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  themeToggle?.setAttribute("aria-pressed", String(isDark));
  themeToggle?.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
};

const savedTheme = localStorage.getItem("ren-theme");
applyTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

themeToggle?.addEventListener("click", () => {
  const nextTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
  localStorage.setItem("ren-theme", nextTheme);
  applyTheme(nextTheme);
});

const setScrollPerformanceMode = (isScrolling) => {
  window.clearTimeout(scrollSettleTimeout);
  document.body.classList.toggle("is-page-scrolling", isScrolling);
};

const settleScrollPerformanceMode = (delay = 140) => {
  window.clearTimeout(scrollSettleTimeout);
  scrollSettleTimeout = window.setTimeout(() => {
    document.body.classList.remove("is-page-scrolling");
  }, delay);
};

const easeScroll = (progress) => 1 - Math.pow(1 - progress, 4);

const animateScrollTo = (targetTop, duration = 820, onComplete) => {
  const startTop = window.scrollY;
  const distance = Math.max(0, targetTop) - startTop;

  cancelAnimationFrame(scrollAnimationFrame);
  animatedScrollActive = true;
  setScrollPerformanceMode(true);

  if (prefersReducedMotion || Math.abs(distance) < 2) {
    window.scrollTo({ top: Math.max(0, targetTop), behavior: "auto" });
    animatedScrollActive = false;
    settleScrollPerformanceMode(80);
    onComplete?.();
    return;
  }

  const startTime = performance.now();

  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = easeScroll(progress);

    window.scrollTo(0, startTop + distance * eased);

    if (progress < 1) {
      scrollAnimationFrame = requestAnimationFrame(step);
    } else {
      scrollAnimationFrame = 0;
      animatedScrollActive = false;
      settleScrollPerformanceMode(120);
      onComplete?.();
    }
  };

  scrollAnimationFrame = requestAnimationFrame(step);
};

const cancelAnimatedScroll = () => {
  if (scrollAnimationFrame) {
    cancelAnimationFrame(scrollAnimationFrame);
    scrollAnimationFrame = 0;
  }
  animatedScrollActive = false;
  settleScrollPerformanceMode(80);
};

const scrollHome = (behavior = "smooth") => {
  if (behavior === "auto") {
    cancelAnimationFrame(scrollAnimationFrame);
    window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }

  animateScrollTo(0, 760);
};

const scrollToTarget = (target, behavior = "smooth", onComplete) => {
  if (!target) {
    return;
  }

  if (target.id === "home") {
    scrollHome(behavior);
    onComplete?.();
    return;
  }

  const headerBottom = siteHeader?.getBoundingClientRect().bottom || 0;
  const anchor = target.querySelector(".section-intro") || target;
  const targetTop = anchor.getBoundingClientRect().top + window.scrollY - headerBottom - 16;

  if (behavior === "auto") {
    cancelAnimationFrame(scrollAnimationFrame);
    window.scrollTo({ top: Math.max(0, targetTop), behavior: "auto" });
    onComplete?.();
    return;
  }

  animateScrollTo(targetTop, 860, onComplete);
};

const closeMobileNav = () => {
  if (!nav || !navToggle) {
    return;
  }

  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
};

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');

  if (!link) {
    return;
  }

  const targetId = link.getAttribute("href");

  if (!targetId || targetId.length <= 1) {
    return;
  }

  const target = document.querySelector(targetId);

  if (!target) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  closeMobileNav();

  if (targetId === "#home") {
    history.replaceState(null, "", window.location.pathname + window.location.search);
    scrollHome();
    return;
  }

  scrollToTarget(target, "smooth", () => {
    history.replaceState(null, "", targetId);
  });
}, { capture: true });

const heroContent = {
  scripting: {
    title: "Ren",
    subtitle: "Roblox Scripter",
    text: "I build scalable systems, with a wide variety of experience.",
  },
  programming: {
    title: "Ren",
    subtitle: "Programmer",
    text: "I build practical, polished software that feels clean to use and reliable under pressure, from web interfaces to product updates people actually depend on.",
  },
};

const animateHeaderResize = (beforeWidth) => {
  if (!siteHeader || prefersReducedMotion || window.matchMedia("(max-width: 820px)").matches) {
    return;
  }

  cancelAnimationFrame(headerAnimationFrame);
  headerResizeAnimation?.cancel();
  siteHeader.style.width = "";

  headerAnimationFrame = requestAnimationFrame(() => {
    const afterWidth = siteHeader.getBoundingClientRect().width;

    siteHeader.style.width = `${beforeWidth}px`;
    siteHeader.getBoundingClientRect();

    headerResizeAnimation = siteHeader.animate(
      [
        { width: `${beforeWidth}px` },
        { width: `${afterWidth}px` },
      ],
      {
        duration: 260,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      }
    );

    siteHeader.style.width = `${afterWidth}px`;
    headerResizeAnimation.addEventListener("finish", () => {
      siteHeader.style.width = "";
      headerResizeAnimation = null;
    }, { once: true });
  });
};

const systemsData = {
  "combat-action-systems": {
    title: "Combat / action systems",
    items: [
      "Server-authoritative hit detection",
      "4-hit M1 combo logic",
      "Heavy attacks",
      "Blocking and block break",
      "Damage handling",
      "Stun handling",
      "Combat state replication",
      "Dash movement",
      "Debug hitboxes",
      "Stamina system",
      "Animation timing",
      "Shift lock behavior",
    ],
  },
  "brainrot-simulator-progression-systems": {
    title: "Brainrot / simulator / progression systems",
    items: [
      "Brainrot spawning systems",
      "Collectible brainrot gameplay systems",
      "Brainrot mutation system",
      "Rarity-based spawn chance systems",
      "Visual variant systems",
      "Multiplier effect systems",
      "Persistence across spawning / pickup / placement / removal / save-load",
      "Inventory pickup flow",
      "Tycoon placement flow",
      "Quest systems",
      "Shop systems",
      "NPC shop-entry flow",
      "Custom token systems",
      "Map changes",
      "Game events",
    ],
  },
  "tycoon-simulator-systems": {
    title: "Tycoon / simulator systems",
    items: [
      "Unit acquire / carry / place / collect / sell loop",
      "Passive income generation (offline)",
      "Server-side validation",
      "Scalable cash handling",
      "Client/server interaction flow for placement and collection",
      "Plot claiming",
      "Auto systems",
      "Weighted pet hatching",
      "Pet inventory systems",
      "Pet equip systems",
      "Rebirth progression",
      "Leaderstats",
      "Datastore saving",
    ],
  },
  "tower-defense-wave-systems": {
    title: "Tower defense / wave systems",
    items: [
      "Round-based enemy spawning",
      "Enemy scaling over time",
      "Waypoint / path-based movement",
      "Base damage on enemy reach",
      "Auto-targeting turret combat",
      "Projectile attacks",
      "Humanoid damage / death handling",
    ],
  },
  "tower-defense-live-game-systems": {
    title: "Tower defense live game systems",
    items: [
      "Live teleportation / elevator system repair",
      "Wave systems",
      "UI / camera handoff / countdown / loading state alignment",
      "Server-controlled teleport behavior alignment",
      "Stats reroll feature",
      "Inventory / unit integration",
    ],
  },
};

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const applyPortfolioMode = (mode, shouldScroll = false, headerBeforeWidth = siteHeader?.getBoundingClientRect().width || 0) => {
  const selectedButton = document.querySelector(`[data-portfolio-mode="${mode}"]`);
  const target = selectedButton?.dataset.modeTarget || "#home";

  document.body.dataset.mode = mode;
  document.body.dataset.choice = "complete";

  modeButtons.forEach((button) => {
    const isActive = button.dataset.portfolioMode === mode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  modeSwitches.forEach((switcher) => {
    switcher.style.setProperty("--switch-index", mode === "programming" ? "1" : "0");
  });

  if (heroWorkLink) {
    heroWorkLink.href = mode === "programming" ? "#programming-work" : "#projects";
  }

  if (heroTitle && heroSubtitle && heroText) {
    heroTitle.textContent = heroContent[mode].title;
    heroSubtitle.textContent = heroContent[mode].subtitle;
    heroText.textContent = heroContent[mode].text;
  }

  if (contactNavNumber) {
    contactNavNumber.textContent = mode === "programming" ? "05" : "06";
  }

  if (pathStatus) {
    pathStatus.textContent = mode === "programming" ? "Showing programming portfolio" : "Showing Roblox scripting portfolio";
  }

  document.querySelectorAll(`[data-track="${mode}"] .reveal`).forEach((item) => {
    item.classList.add("is-visible");
  });

  if (shouldScroll) {
    if (target === "#home") {
      scrollHome();
    } else {
      scrollToTarget(document.querySelector(target));
    }
  }

  animateHeaderResize(headerBeforeWidth);
  window.setTimeout(() => {
    document.body.classList.remove("is-switching-mode");
  }, 220);
};

const setPortfolioMode = (mode, shouldScroll = false) => {
  const choiceScreenVisible = document.body.dataset.choice !== "complete";
  const currentMode = choiceScreenVisible ? "" : document.body.dataset.mode;
  const headerBeforeWidth = siteHeader?.getBoundingClientRect().width || 0;

  window.clearTimeout(modeTransitionTimeout);
  window.clearTimeout(entryTransitionTimeout);
  document.body.classList.add("is-switching-mode");

  if (!currentMode) {
    window.scrollTo({ top: 0, behavior: "auto" });
    document.body.classList.add("is-entering-portfolio");
    applyPortfolioMode(mode, shouldScroll, headerBeforeWidth);
    document.body.dataset.choice = "pending";
    document.body.classList.add("is-mode-transitioning");

    entryTransitionTimeout = window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
      document.body.dataset.choice = "complete";

      requestAnimationFrame(() => {
        document.body.classList.remove("is-mode-transitioning");
        document.body.classList.remove("is-entering-portfolio");
      });
    }, prefersReducedMotion ? 0 : 360);
    return;
  }

  if (currentMode === mode || prefersReducedMotion) {
    applyPortfolioMode(mode, shouldScroll, headerBeforeWidth);
    document.body.classList.remove("is-mode-transitioning");
    return;
  }

  document.body.classList.add("is-mode-transitioning");
  document.body.getBoundingClientRect();

  modeTransitionTimeout = window.setTimeout(() => {
    applyPortfolioMode(mode, shouldScroll, headerBeforeWidth);

    requestAnimationFrame(() => {
      document.body.classList.remove("is-mode-transitioning");
    });
  }, 220);
};

modeButtons.forEach((button) => {
  button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));

  button.addEventListener("click", () => {
    setPortfolioMode(button.dataset.portfolioMode, true);
  });
});

applyPortfolioMode("scripting");

const openSystemsModal = (systemKey) => {
  const system = systemsData[systemKey];

  if (!system || !modalBackdrop || !modalTitle || !modalList) {
    return;
  }

  modalTitle.textContent = system.title;
  modalList.innerHTML = "";

  system.items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    modalList.appendChild(li);
  });

  modalBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
};

const closeSystemsModal = () => {
  if (!modalBackdrop) {
    return;
  }

  modalBackdrop.hidden = true;
  document.body.style.overflow = "";
};

const openVideoModal = (title, src) => {
  if (!videoModalBackdrop || !videoModalTitle || !videoModalFrame) {
    return;
  }

  videoModalTitle.textContent = title;
  videoModalFrame.src = src;
  videoModalBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
};

const closeVideoModal = () => {
  if (!videoModalBackdrop || !videoModalFrame) {
    return;
  }

  videoModalBackdrop.hidden = true;
  videoModalFrame.src = "";
  document.body.style.overflow = "";
};

systemTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    openSystemsModal(trigger.dataset.system);
  });
});

projectTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    openVideoModal(trigger.dataset.title, trigger.dataset.video);
  });
});

if (modalClose) {
  modalClose.addEventListener("click", closeSystemsModal);
}

if (videoModalClose) {
  videoModalClose.addEventListener("click", closeVideoModal);
}

if (modalBackdrop) {
  modalBackdrop.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) {
      closeSystemsModal();
    }
  });
}

if (videoModalBackdrop) {
  videoModalBackdrop.addEventListener("click", (event) => {
    if (event.target === videoModalBackdrop) {
      closeVideoModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSystemsModal();
    closeVideoModal();
  }
});

window.addEventListener("pagehide", cancelAnimatedScroll);

window.addEventListener("scroll", () => {
  if (document.body.dataset.choice === "complete" && !animatedScrollActive) {
    setScrollPerformanceMode(true);
    settleScrollPerformanceMode(140);
  }
}, { passive: true });

["wheel", "touchstart"].forEach((eventName) => {
  window.addEventListener(eventName, cancelAnimatedScroll, { passive: true });
});

const startRevealObserver = () => {
  const immediateRevealItems = revealItems.filter((item) => item.closest("#home, .choice-screen"));
  const deferredRevealItems = revealItems.filter((item) => !immediateRevealItems.includes(item));

  immediateRevealItems.forEach((item) => item.classList.add("is-visible"));

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    deferredRevealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -24px 0px",
    }
  );

  deferredRevealItems.forEach((item) => observer.observe(item));
};

if ("requestIdleCallback" in window) {
  window.requestIdleCallback(startRevealObserver, { timeout: 650 });
} else {
  window.setTimeout(startRevealObserver, 120);
}
