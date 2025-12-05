(() => {
  const initialTheme = localStorage.getItem("selectedTheme") || "light";
  const pageName = resolvePageName();
  const basePath = window.location.pathname.includes("/themes/") ? "../" : "";

  ensureCss(`${basePath}css/root.css`, "root-theme-css");
  ensureCss(`${basePath}css/layout.css`, "layout-theme-css");
  ensureCss(`${basePath}css/${pageName}.css`, "page-theme-css");

  // Apply base theme immediately to avoid flash of incorrect theme
  document.documentElement.setAttribute("data-theme", initialTheme);

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
  document.documentElement.setAttribute("data-theme", theme);
}

function resolvePageName() {
  let currentPage = window.location.pathname.split("/").pop();
  if (!currentPage) {
    return "index";
  }

  return currentPage.split(".")[0];
}

function ensureCss(href, id) {
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = href;
  link.id = id;
  document.head.appendChild(link);
}
