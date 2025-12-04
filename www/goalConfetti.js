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
  const max_particles = 350;
  const confettiDuration = 5000; // 5 seconds
  const today = new Date().toDateString();
  const confettiTag = "confetti-already-fired";
  const start = parseInt(localStorage.getItem("pereksTodayStartIndex") || "0");
  const goalAmount = parseInt(localStorage.getItem("perekGoal") || "18");
  const goalIndex = start + goalAmount + 1; // +1 to account for the current perek

  const currentIndex =
    parseInt(localStorage.getItem("globalPerekIndex") || "1") - 0;
  const lastDate = localStorage.getItem("lastDate") || "";

  const alreadyFired = localStorage.getItem(confettiTag + today);
  if (alreadyFired === "true") return;

  if (currentIndex >= goalIndex && lastDate === today) {
    localStorage.setItem(confettiTag + today, "true");
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
                0% { transform: translateY(0vh); opacity: 1; }
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
