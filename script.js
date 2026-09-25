

// v8 portfolio filters and collapsible project cards
document.addEventListener("DOMContentLoaded",()=>{const cards=[...document.querySelectorAll(".project-card")],filterButtons=[...document.querySelectorAll(".filter-btn")],toggles=[...document.querySelectorAll(".project-toggle")],expandAll=document.getElementById("expand-all"),collapseAll=document.getElementById("collapse-all");function setCardExpanded(t,e){const c=t.nextElementSibling;t.setAttribute("aria-expanded",String(e));t.textContent=e?"Hide details":"View details";if(c&&c.classList.contains("project-content"))c.hidden=!e}toggles.forEach(t=>{setCardExpanded(t,false);t.addEventListener("click",()=>setCardExpanded(t,t.getAttribute("aria-expanded")!=="true"))});filterButtons.forEach(b=>{b.addEventListener("click",()=>{const f=b.dataset.filter;filterButtons.forEach(x=>x.classList.remove("is-active"));b.classList.add("is-active");cards.forEach(c=>{const tags=(c.dataset.tags||"").split(/\s+/);c.classList.toggle("is-hidden",!(f==="all"||tags.includes(f)))})})});if(expandAll)expandAll.addEventListener("click",()=>toggles.forEach(t=>setCardExpanded(t,true)));if(collapseAll)collapseAll.addEventListener("click",()=>toggles.forEach(t=>setCardExpanded(t,false)))});




// v16 theme controller compiled from src/theme.ts
(() => {
  const STORAGE_KEY = "portfolio-theme";
  const systemQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const label = document.getElementById("theme-label");
  const buttons = Array.from(document.querySelectorAll("[data-theme-choice]"));

  function getStoredChoice() {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" || value === "system" ? value : "system";
  }

  function resolveTheme(choice) {
    if (choice === "light" || choice === "dark") return choice;
    return systemQuery.matches ? "dark" : "light";
  }

  function updateLabel(choice, resolved) {
    if (!label) return;
    const resolvedLabel = resolved === "dark" ? "Dark" : "Light";
    if (choice === "system") {
      label.textContent = `Theme: System (${resolvedLabel})`;
    } else {
      label.textContent = `Theme: ${resolvedLabel}`;
    }
  }

  function applyTheme(choice) {
    const resolved = resolveTheme(choice);
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themeChoice = choice;
    updateLabel(choice, resolved);

    buttons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.themeChoice === choice);
    });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.dataset.themeChoice || "system";
      window.localStorage.setItem(STORAGE_KEY, choice);
      applyTheme(choice);
    });
  });

  systemQuery.addEventListener("change", () => {
    if (getStoredChoice() === "system") applyTheme("system");
  });

  applyTheme(getStoredChoice());
})();


// v25 robust portfolio filters: filter by project sections and scroll to selected section
document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
  const groups = Array.from(document.querySelectorAll(".project-group"));
  const cards = Array.from(document.querySelectorAll(".project-card"));

  const groupByFilter = {
    web: "web-ui",
    qa: "qa-testing",
    software: "software-apps",
    systems: "systems-infra",
    database: "data-networks"
  };

  function setActiveButton(filter) {
    filterButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.filter === filter);
    });
  }

  function showAll() {
    groups.forEach((group) => group.classList.remove("is-hidden"));
    cards.forEach((card) => card.classList.remove("is-hidden"));
  }

  function filterPortfolio(filter, shouldScroll = true) {
    setActiveButton(filter);

    if (filter === "all") {
      showAll();
      const section = document.getElementById("portfolio-projects") || document.querySelector(".portfolio-sectioned");
      if (shouldScroll && section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (filter === "automation") {
      groups.forEach((group) => group.classList.remove("is-hidden"));
      cards.forEach((card) => {
        const tags = (card.dataset.tags || "").split(/\s+/);
        card.classList.toggle("is-hidden", !tags.includes("automation"));
      });

      groups.forEach((group) => {
        const visibleCards = Array.from(group.querySelectorAll(".project-card")).some((card) => !card.classList.contains("is-hidden"));
        group.classList.toggle("is-hidden", !visibleCards);
      });

      const firstVisible = document.querySelector(".project-group:not(.is-hidden)");
      if (shouldScroll && firstVisible) firstVisible.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    groups.forEach((group) => {
      group.classList.toggle("is-hidden", group.dataset.category !== filter);
    });
    cards.forEach((card) => card.classList.remove("is-hidden"));

    const targetId = groupByFilter[filter];
    const target = targetId ? document.getElementById(targetId) : document.querySelector(`.project-group[data-category="${filter}"]`);
    if (shouldScroll && target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const filter = button.dataset.filter || "all";
      filterPortfolio(filter, true);
    }, true);
  });

  // Make the helper available for quick manual QA in DevTools.
  window.portfolioFilter = filterPortfolio;
});

// v27.1 quick project search + back-to-top helper
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("project-search");
  const searchStatus = document.getElementById("search-status");
  const cards = Array.from(document.querySelectorAll(".project-card"));
  const groups = Array.from(document.querySelectorAll(".project-group"));
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
  const backToTop = document.getElementById("back-to-top");

  function normalize(value) {
    return (value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function runSearch() {
    if (!searchInput) return;
    const query = normalize(searchInput.value);

    if (!query) {
      cards.forEach((card) => {
        card.classList.remove("search-match");
        card.classList.remove("is-hidden");
      });
      groups.forEach((group) => group.classList.remove("is-hidden"));
      if (searchStatus) searchStatus.textContent = "";
      return;
    }

    filterButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.filter === "all");
    });

    let matches = 0;
    cards.forEach((card) => {
      const haystack = normalize(`${card.textContent} ${card.dataset.tags || ""}`);
      const isMatch = haystack.includes(query);
      card.classList.toggle("is-hidden", !isMatch);
      card.classList.toggle("search-match", isMatch);
      if (isMatch) matches += 1;
    });

    groups.forEach((group) => {
      const hasVisible = Array.from(group.querySelectorAll(".project-card"))
        .some((card) => !card.classList.contains("is-hidden"));
      group.classList.toggle("is-hidden", !hasVisible);
    });

    if (searchStatus) {
      searchStatus.textContent = `${matches} project${matches === 1 ? "" : "s"} found`;
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", runSearch);

    document.addEventListener("keydown", (event) => {
      const target = event.target;
      const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchInput.focus();
      }
      if (event.key === "Escape" && document.activeElement === searchInput) {
        searchInput.value = "";
        runSearch();
        searchInput.blur();
      }
    });

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (searchInput.value) {
          searchInput.value = "";
          if (searchStatus) searchStatus.textContent = "";
          cards.forEach((card) => card.classList.remove("search-match"));
        }
      });
    });
  }

  if (backToTop) {
    const updateBackToTop = () => {
      backToTop.classList.toggle("is-visible", window.scrollY > 700);
    };
    window.addEventListener("scroll", updateBackToTop, { passive: true });
    updateBackToTop();
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});


// v28 sticky navigator and compact project groups
// v28.1: section navigation is based on the actual viewport position, so
// previous/next keeps working even while the user is deep inside a long group.
document.addEventListener("DOMContentLoaded", () => {
  const navigator = document.getElementById("project-sticky-nav");
  const portfolio = document.getElementById("portfolio-projects");
  const groups = Array.from(document.querySelectorAll(".project-group"));
  const navLinks = Array.from(document.querySelectorAll("[data-project-section]"));
  const currentLabel = document.getElementById("project-sticky-label");
  const prevButton = document.getElementById("project-prev");
  const nextButton = document.getElementById("project-next");
  const compactButton = document.getElementById("project-collapse-groups");

  if (!navigator || !portfolio || !groups.length) return;

  const labels = {
    "web-ui": "Web/UI",
    "qa-testing": "QA",
    "software-apps": "Software",
    "systems-infra": "Systems",
    "data-networks": "Data"
  };

  groups.forEach((group) => {
    const header = group.querySelector(".project-group-header");
    const title = header?.querySelector("h2");
    if (!header || !title) return;

    const count = group.querySelectorAll(".project-card").length;
    if (!title.querySelector(".project-group-count")) {
      const badge = document.createElement("span");
      badge.className = "project-group-count";
      badge.textContent = String(count);
      badge.setAttribute("aria-label", `${count} projects`);
      title.appendChild(badge);
    }

    if (!header.querySelector(".project-group-toggle")) {
      const wrap = document.createElement("div");
      wrap.className = "project-group-header-main";
      while (header.firstChild) wrap.appendChild(header.firstChild);
      header.appendChild(wrap);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "project-group-toggle";
      button.textContent = "Collapse group";
      button.setAttribute("aria-expanded", "true");
      header.appendChild(button);

      button.addEventListener("click", () => {
        const collapsed = group.classList.toggle("is-group-collapsed");
        button.setAttribute("aria-expanded", String(!collapsed));
        button.textContent = collapsed ? "Expand group" : "Collapse group";
        requestAnimationFrame(updateCurrentFromScroll);
      });
    }
  });

  function visibleGroups() {
    return groups.filter((group) => !group.classList.contains("is-hidden"));
  }

  function stickyOffset() {
    const navHeight = document.querySelector("nav")?.getBoundingClientRect().height || 0;
    const stickyHeight = navigator.getBoundingClientRect().height || 0;
    return navHeight + stickyHeight + 28;
  }

  function setCurrent(id) {
    if (!id) return;
    navLinks.forEach((link) => link.classList.toggle("is-active", link.dataset.projectSection === id));
    if (currentLabel) currentLabel.textContent = labels[id] || "Projects";
    navigator.dataset.currentSection = id;
    updateArrowState();
  }

  // Determine the current group from where the user actually is on the page,
  // not from IntersectionObserver ratios (large groups made that unreliable).
  function currentGroupFromScroll() {
    const list = visibleGroups();
    if (!list.length) return null;
    const line = stickyOffset();
    let current = list[0];
    for (const group of list) {
      if (group.getBoundingClientRect().top <= line) current = group;
      else break;
    }
    return current;
  }

  function updateCurrentFromScroll() {
    const current = currentGroupFromScroll();
    if (current) setCurrent(current.id);
  }

  function updateArrowState() {
    const list = visibleGroups();
    const current = currentGroupFromScroll();
    const idx = current ? list.indexOf(current) : -1;
    if (prevButton) prevButton.disabled = idx <= 0;
    if (nextButton) nextButton.disabled = idx < 0 || idx >= list.length - 1;
  }

  function scrollToGroup(group) {
    if (!group) return;
    group.scrollIntoView({ behavior: "smooth", block: "start" });
    // Set immediately so fast repeated arrow clicks work during smooth scrolling.
    setCurrent(group.id);
  }

  function goRelative(delta) {
    const list = visibleGroups();
    if (!list.length) return;

    const current = currentGroupFromScroll();
    let idx = current ? list.indexOf(current) : 0;
    const targetIndex = Math.max(0, Math.min(list.length - 1, idx + delta));
    scrollToGroup(list[targetIndex]);
  }

  prevButton?.addEventListener("click", () => goRelative(-1));
  nextButton?.addEventListener("click", () => goRelative(1));

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.dataset.projectSection;
      const target = id ? document.getElementById(id) : null;
      if (!target || target.classList.contains("is-hidden")) return;
      event.preventDefault();
      scrollToGroup(target);
    });
  });

  let compact = false;
  compactButton?.addEventListener("click", () => {
    compact = !compact;
    compactButton.setAttribute("aria-pressed", String(compact));
    compactButton.textContent = compact ? "Expand groups" : "Compact groups";
    groups.forEach((group) => {
      group.classList.toggle("is-group-collapsed", compact);
      const button = group.querySelector(".project-group-toggle");
      if (button) {
        button.setAttribute("aria-expanded", String(!compact));
        button.textContent = compact ? "Expand group" : "Collapse group";
      }
    });
    requestAnimationFrame(updateCurrentFromScroll);
  });

  // Only use IntersectionObserver to show/hide the sticky navigator.
  const portfolioObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => navigator.classList.toggle("is-visible", entry.isIntersecting));
  }, { rootMargin: "-70px 0px -35% 0px", threshold: 0.01 });
  portfolioObserver.observe(portfolio);

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateCurrentFromScroll();
      ticking = false;
    });
  }, { passive: true });
  window.addEventListener("resize", updateCurrentFromScroll, { passive: true });

  setCurrent(groups[0].id);
  updateCurrentFromScroll();
});

