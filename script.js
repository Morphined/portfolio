

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
