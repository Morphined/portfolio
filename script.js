

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
