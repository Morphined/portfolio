// Manual + automatic light/dark theme controller for the portfolio.
// The site defaults to the user's system preference and allows manual override.
// The compiled runtime is included in script.js for GitHub Pages/static hosting.

type ThemeChoice = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "portfolio-theme";
const systemThemeQuery: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
const themeLabel: HTMLElement | null = document.getElementById("theme-label");
const themeButtons: HTMLButtonElement[] = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[data-theme-choice]")
);

function getStoredChoice(): ThemeChoice {
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

function resolveTheme(choice: ThemeChoice): ResolvedTheme {
  if (choice === "light" || choice === "dark") return choice;
  return systemThemeQuery.matches ? "dark" : "light";
}

function updateLabel(choice: ThemeChoice, resolved: ResolvedTheme): void {
  if (!themeLabel) return;

  const resolvedLabel = resolved === "dark" ? "Dark" : "Light";
  themeLabel.textContent =
    choice === "system" ? `Theme: System (${resolvedLabel})` : `Theme: ${resolvedLabel}`;
}

function applyTheme(choice: ThemeChoice): void {
  const resolved = resolveTheme(choice);

  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeChoice = choice;
  updateLabel(choice, resolved);

  themeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.themeChoice === choice);
  });
}

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const choice = (button.dataset.themeChoice as ThemeChoice | undefined) ?? "system";
    window.localStorage.setItem(STORAGE_KEY, choice);
    applyTheme(choice);
  });
});

systemThemeQuery.addEventListener("change", () => {
  if (getStoredChoice() === "system") applyTheme("system");
});

applyTheme(getStoredChoice());
