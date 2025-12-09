window.checkAndLaunchGoalConfetti = function () {
  const colors = [
    "#007bff",
    "#6c757d",
    "#28a745",
    "#17a2b8",
    "#ffc107",
    "#dc3545",
    "#f8f9fa",
  ];
  const max_particles = 250;
  const confettiDuration = 4000; // 4 seconds

  // Use ISO date for key, but keep lastDate (toDateString) for your existing logic
  const todayIso = new Date().toISOString().split("T")[0]; // e.g. "2025-07-18"
  const todayNice = new Date().toDateString(); // e.g. "Fri Jul 18 2025"

  const confettiPrefix = "confetti-already-fired-";

  // --- CLEAN UP OLD CONFETTI FLAGS ---
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (!key) continue;

    if (key.startsWith(confettiPrefix) && key !== confettiPrefix + todayIso) {
      localStorage.removeItem(key);
    }
  }

  // --- GOAL / INDEX LOGIC ---
  const start = parseInt(
    localStorage.getItem("pereksTodayStartIndex") || "0",
    10
  );
  const goalAmount = parseInt(localStorage.getItem("perekGoal") || "18", 10);
  const goalIndex = start + goalAmount; // this is zero-based like your other code

  const currentIndex =
    parseInt(localStorage.getItem("globalPerekIndex") || "1", 10) - 1;
  const lastDate = localStorage.getItem("lastDate") || "";

  const todayKey = confettiPrefix + todayIso;
  const alreadyFired = localStorage.getItem(todayKey);
  if (alreadyFired === "true") return;

  if (currentIndex >= goalIndex && lastDate === todayNice) {
    localStorage.setItem(todayKey, "true");
    injectConfettiStyles();
    launchConfetti();
  }

  function launchConfetti() {
    const particles = [];
    let colorIndex = 0;

    for (let i = 0; i < max_particles; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");
      particle.style.position = "absolute";
      particle.style.top = "0";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.backgroundColor = colors[colorIndex];
      particle.style.width = particle.style.height =
        Math.random() * 0.5 + 0.75 + "em";
      particle.style.animation = `fall ${Math.random() * 1 + 1.5}s linear ${
        Math.random() * 2
      }s forwards`;
      document.body.appendChild(particle);
      particles.push(particle);
      colorIndex = (colorIndex + 1) % colors.length;
    }

    setTimeout(() => {
      particles.forEach((p) => p.remove());
    }, confettiDuration + 2000);
  }

  function injectConfettiStyles() {
    if (document.getElementById("confetti-style")) return;

    const style = document.createElement("style");
    style.id = "confetti-style";
    style.textContent = `
      @keyframes fall {
        0%   { transform: translateY(0vh);   opacity: 1; }
        100% { transform: translateY(100vh); opacity: 0; }
      }
      .particle {
        will-change: transform;
        border-radius: 50%;
        z-index: 9999;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }
};
