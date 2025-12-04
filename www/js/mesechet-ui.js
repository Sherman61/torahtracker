// js/mesechet-ui.js
// Helper to build the mesechet <li><p class="bb bbX">Name</p></li> list
// from js/mesechot-data.js

(function (global) {
  function getMesechotData() {
    // Prefer explicit window.mesechotData if you ever set it
    if (Array.isArray(global.mesechotData)) {
      return global.mesechotData;
    }

    // Fallback: use the global const mesechotData if it exists
    try {
      if (typeof mesechotData !== "undefined" && Array.isArray(mesechotData)) {
        return mesechotData;
      }
    } catch (e) {
      // ReferenceError if mesechotData is not defined at all
    }

    return null;
  }

  function buildMesechetList(containerId, options) {
    const opts = options || {};
    const container = document.getElementById(containerId);
    const data = getMesechotData();

    const containerFound = !!container;
    const isArray = Array.isArray(data);

    if (!containerFound || !isArray) {
      console.warn("buildMesechetList: missing container or mesechotData ", {
        containerFound,
        dataIsArray: isArray,
      });
      return;
    }

    container.innerHTML = "";

    data.forEach((item, index) => {
      const li = document.createElement("li");
      const p = document.createElement("p");

      // Keep your bb + bb{pereks} classes
      p.classList.add("bb", `bb${item.pereks}`);
      p.textContent = item.name;
      p.dataset.mesechetIndex = String(index + 1);

      li.appendChild(p);
      container.appendChild(li);
    });

    if (typeof opts.onBuilt === "function") {
      opts.onBuilt(container, data);
    }
  }

  // Expose globally
  global.buildMesechetList = buildMesechetList;
})(window);
