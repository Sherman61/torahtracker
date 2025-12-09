// js/settings.js
// Shared helpers used by BOTH settings.html and start-perek.html

function initPerekGoalControls(config) {
  const {
    goalElId,
    editBtnId,
    panelId, // optional: container for input + buttons
    inputId,
    saveBtnId,
    cancelBtnId,
    renderGoal,
    deferInitialRender, // NEW: optional flag
  } = config;

  const goalEl = document.getElementById(goalElId);
  const editBtn = document.getElementById(editBtnId);
  const panel = panelId ? document.getElementById(panelId) : null;
  const input = document.getElementById(inputId);
  const saveBtn = document.getElementById(saveBtnId);
  const cancelBtn = document.getElementById(cancelBtnId);

  // Log if something is missing, but DO NOT bail out hard
  if (!goalEl || !editBtn || !input || !saveBtn || !cancelBtn) {
    console.warn("initPerekGoalControls: missing elements", {
      goalEl: !!goalEl,
      editBtn: !!editBtn,
      panel: !!panel,
      input: !!input,
      saveBtn: !!saveBtn,
      cancelBtn: !!cancelBtn,
    });
  }

  let perekGoal = parseInt(localStorage.getItem("perekGoal"), 10);
  if (isNaN(perekGoal) || perekGoal <= 0) {
    perekGoal = 18; // default
    localStorage.setItem("perekGoal", perekGoal);
  }

  function safeRender() {
    if (!goalEl) return;

    if (typeof renderGoal === "function") {
      try {
        renderGoal(goalEl, perekGoal);
      } catch (err) {
        console.error("renderGoal threw an error:", err);
      }
    } else {
      goalEl.textContent = "Daily perek goal: " + perekGoal;
    }
  }

  function updateGoalDisplay() {
    safeRender();
  }

  function showEditor() {
    if (!input) return;

    input.value = perekGoal;

    if (panel) {
      panel.style.display = "flex";
    } else {
      input.style.display = "inline-block";
    }

    input.focus();
  }

  function hideEditor() {
    if (panel) {
      panel.style.display = "none";
    } else if (input) {
      input.style.display = "none";
    }
  }

  if (editBtn) {
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = panel
        ? panel.style.display === "none" || panel.style.display === ""
        : input.style.display === "none" || input.style.display === "";

      if (isHidden) {
        showEditor();
      } else {
        hideEditor();
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!input) return;

      const newVal = parseInt(input.value, 10);
      if (!isNaN(newVal) && newVal > 0) {
        perekGoal = newVal;
        localStorage.setItem("perekGoal", perekGoal);
        updateGoalDisplay();
      } else {
        input.value = perekGoal;
      }
      hideEditor();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      hideEditor();
    });
  }

  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (saveBtn) saveBtn.click();
      } else if (e.key === "Escape") {
        if (cancelBtn) cancelBtn.click();
      }
    });
  }

  // Initial render, but can be skipped if deferInitialRender === true
  if (!deferInitialRender) {
    updateGoalDisplay();
  }

  return {
    getPerekGoal: () => perekGoal,
    setPerekGoal: (val) => {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num > 0) {
        perekGoal = num;
        localStorage.setItem("perekGoal", perekGoal);
        updateGoalDisplay();
      }
    },
    updateGoalDisplay,
  };
}

function initPerekGoalToggle(config) {
  const { toggleBtnId, statusElId, goalContainerSelector, onToggle } = config;

  const toggleBtn = document.getElementById(toggleBtnId);
  const statusEl = document.getElementById(statusElId);
  const goalContainer = goalContainerSelector
    ? document.querySelector(goalContainerSelector)
    : null;

  let displayPerekGoal = localStorage.getItem("displayPerekGoal");
  if (displayPerekGoal === null) {
    displayPerekGoal = "true";
    localStorage.setItem("displayPerekGoal", displayPerekGoal);
  }

  function refresh() {
    const current = localStorage.getItem("displayPerekGoal") === "true";

    if (statusEl) {
      statusEl.textContent = current
        ? "Goal display is ON"
        : "Goal display is OFF";
    }

    if (goalContainer) {
      goalContainer.style.display = current ? "block" : "none";
    }

    if (typeof onToggle === "function") {
      onToggle(current);
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = localStorage.getItem("displayPerekGoal") === "true";
      localStorage.setItem("displayPerekGoal", (!current).toString());
      refresh();
    });
  }

  // Initial sync
  refresh();
}

function initScrollToMesechetToggle(config) {
  const { toggleBtnId, statusElId } = config;

  const toggleBtn = document.getElementById(toggleBtnId);
  const statusEl = document.getElementById(statusElId);

  // default: ON
  let enabled = localStorage.getItem("scrollToCurrentMesechet");
  if (enabled === null) {
    enabled = "true";
    localStorage.setItem("scrollToCurrentMesechet", enabled);
  }

  function refresh() {
    const isOn = localStorage.getItem("scrollToCurrentMesechet") === "true";
    if (statusEl) {
      statusEl.textContent = isOn
        ? "Auto scroll to current masechet is ON"
        : "Auto scroll to current masechet is OFF";
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const isOn = localStorage.getItem("scrollToCurrentMesechet") === "true";
      localStorage.setItem("scrollToCurrentMesechet", (!isOn).toString());
      refresh();
    });
  }

  // Initial sync
  refresh();
}
