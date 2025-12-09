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

function initScrollToggles(config) {
  const { globalBtnId, mishBtnId, tehBtnId, statusElId } = config;

  const globalBtn = document.getElementById(globalBtnId);
  const mishBtn = document.getElementById(mishBtnId);
  const tehBtn = document.getElementById(tehBtnId);
  const statusEl = document.getElementById(statusElId);

  if (!globalBtn || !mishBtn || !tehBtn || !statusEl) return;

  function getStates() {
    const globalRaw = localStorage.getItem("scrollGlobal");
    const mishRaw = localStorage.getItem("scrollMishnayes");
    const tehRaw = localStorage.getItem("scrollTehillim");

    // default everything ON if never set
    const globalOn = globalRaw === null || globalRaw === "true";
    const mishOn = mishRaw === null || mishRaw === "true";
    const tehOn = tehRaw === null || tehRaw === "true";

    return { globalOn, mishOn, tehOn };
  }

  function setStates({ globalOn, mishOn, tehOn }) {
    localStorage.setItem("scrollGlobal", globalOn.toString());
    localStorage.setItem("scrollMishnayes", mishOn.toString());
    localStorage.setItem("scrollTehillim", tehOn.toString());
  }

  function updateToggleButton(btn, isOn, disabled) {
    btn.classList.remove("on", "off", "disabled");
    btn.classList.add(isOn ? "on" : "off");
    if (disabled) btn.classList.add("disabled");

    const icon = btn.querySelector("i");
    const text = btn.querySelector(".toggle-text");

    if (icon) {
      icon.className = isOn
        ? "fa-solid fa-toggle-on"
        : "fa-solid fa-toggle-off";
    }
    if (text) {
      text.textContent = isOn ? "On" : "Off";
    }

    btn.disabled = !!disabled;
  }

  function refreshUI() {
    const { globalOn, mishOn, tehOn } = getStates();

    updateToggleButton(globalBtn, globalOn, false);
    updateToggleButton(mishBtn, mishOn && globalOn, !globalOn);
    updateToggleButton(tehBtn, tehOn && globalOn, !globalOn);

    if (!globalOn) {
      statusEl.textContent =
        "Global auto scroll is OFF. Mishnayes and Tehillim will not auto scroll.";
    } else {
      statusEl.textContent = `Global ON. Mishnayes: ${
        mishOn ? "On" : "Off"
      }, Tehillim: ${tehOn ? "On" : "Off"}.`;
    }
  }

  // Click handlers
  globalBtn.addEventListener("click", () => {
    const { globalOn } = getStates();

    if (globalOn) {
      // Turn everything off
      setStates({ globalOn: false, mishOn: false, tehOn: false });
    } else {
      // Turn everything on by default
      setStates({ globalOn: true, mishOn: true, tehOn: true });
    }
    refreshUI();
  });

  mishBtn.addEventListener("click", () => {
    const { globalOn, mishOn, tehOn } = getStates();
    if (!globalOn) return; // respect global off

    setStates({ globalOn, mishOn: !mishOn, tehOn });
    refreshUI();
  });

  tehBtn.addEventListener("click", () => {
    const { globalOn, mishOn, tehOn } = getStates();
    if (!globalOn) return; // respect global off

    setStates({ globalOn, mishOn, tehOn: !tehOn });
    refreshUI();
  });

  refreshUI();
}
