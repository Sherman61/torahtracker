(() => {
  const initialTheme = localStorage.getItem("selectedTheme") || "light"; // Default to light theme if not set

  // Apply base theme immediately to avoid flash of incorrect theme
  document.documentElement.setAttribute("data-theme", initialTheme);
  ensureRootCss();
  applyTheme(initialTheme);

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

    // Show the content after applying the theme
    document.body.style.display = "block";
  });
})();

function applyTheme(theme) {
  let currentPage = window.location.pathname.split("/").pop();
  if (!currentPage) {
    currentPage = "index.html"; // Default to index.html if no page name is found
  }
  const pageName = currentPage.split(".")[0];

  document.documentElement.setAttribute("data-theme", theme);

  // Remove existing theme CSS if present
  removeExistingThemeCss("theme-css");
  removeExistingThemeCss("bottom-nav-css");

  // Add the new theme CSS
  addThemeCss(`themes/${theme}/${pageName}.css`, "theme-css");
  addThemeCss(`themes/${theme}/bottom-nav.css`, "bottom-nav-css");
}

function ensureRootCss() {
  if (document.getElementById("root-theme-css")) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = "themes/root.css";
  link.id = "root-theme-css";
  document.head.appendChild(link);
}

function addThemeCss(href, id) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = href;
  link.id = id;
  document.head.appendChild(link);
}

function removeExistingThemeCss(id) {
  const existingLink = document.getElementById(id);
  if (existingLink) {
    document.head.removeChild(existingLink);
  }
}
