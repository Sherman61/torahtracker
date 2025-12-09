// themes/theme.js

(() => {
  const initialTheme = localStorage.getItem("selectedTheme") || "light";

  // Apply theme ASAP
  document.documentElement.setAttribute("data-theme", initialTheme);

  // Always load the shared theme root CSS
  ensureRootCss();

  document.addEventListener("DOMContentLoaded", () => {
    const themeSelector = document.getElementById("theme-selector");
    if (themeSelector) {
      themeSelector.value = initialTheme;
      themeSelector.addEventListener("change", () => {
        const newTheme = themeSelector.value;
        localStorage.setItem("selectedTheme", newTheme);
        applyTheme(newTheme);
      });
    }
  });
})();

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function ensureRootCss() {
  ensureCss("themes/root.css", "root-theme-css");
}

function ensureCss(href, id) {
  if (!href || !id) return;
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = href;
  link.id = id;
  document.head.appendChild(link);
}
