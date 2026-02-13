document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;
  let celebrationTriggered = false;

  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;

    // Dynamic lighting: radius = 200px + (candleCount * 50px), scaled by viewport so edge stays soft on large screens
    const baseRadius = 200 + activeCandles * 50;
    const viewportScale = Math.min(window.innerWidth, window.innerHeight) * 0.4;
    const glowRadiusPx = baseRadius + viewportScale;
    const root = document.documentElement;

    if (activeCandles === 0) {
      root.style.setProperty("--glow-radius", "0px");
      root.style.setProperty("--glow-opacity", "0");
      root.style.setProperty("--glow-center-opacity", "0");
      root.style.setProperty("--cake-brightness", "0.55");
      root.style.setProperty("--cake-glow-spread", "0px");
    } else {
      root.style.setProperty("--glow-radius", glowRadiusPx + "px");
      // Warm glow intensity scales with candles (cap for many candles), slightly brighter overall
      const intensity = Math.min(0.58 + activeCandles * 0.07, 0.96);
      root.style.setProperty("--glow-opacity", String(intensity));
      root.style.setProperty("--glow-center-opacity", String(Math.min(0.35 + activeCandles * 0.09, 0.96)));
      root.style.setProperty("--cake-brightness", String(0.58 + Math.min(activeCandles * 0.055, 0.48)));
      root.style.setProperty("--cake-glow-spread", 10 + activeCandles * 8 + "px");
    }
  }

  function addCandle(left, top) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    cake.appendChild(candle);
    candles.push(candle);
    updateCandleCount();
    // After first candle, show blow hint
    if (candles.length === 1) {
      document.getElementById("hint-add-candles").classList.add("hint--hidden");
      
      setTimeout(() => {
        // Only show blow hint if candles are still lit
        const anyLit = candles.some(c => !c.classList.contains("out"));
        if (anyLit && !celebrationTriggered) {
          document.getElementById("hint-blow").classList.remove("hint--hidden");
        }
      }, 1500);
    }
  }

  cake.addEventListener("click", function (event) {
    const rect = cake.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    addCandle(left, top);
  });

  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    let average = sum / bufferLength;

    return average > 40; //
  }

  function blowOutCandles() {
    let blownOut = 0;

    if (isBlowing()) {
      candles.forEach((candle) => {
        document.getElementById("hint-blow").classList.add("hint--hidden");
        if (!candle.classList.contains("out") && Math.random() > 0.5) {
          candle.classList.add("out");
          blownOut++;
        }
      });
    }

    if (blownOut > 0) {
      updateCandleCount();
      const allOut = candles.every(function (c) {
        return c.classList.contains("out");
      });
      if (allOut && !celebrationTriggered) {
        celebrationTriggered = true;
        runCelebration();
      }
    }
  }

  function runCelebration() {
    var darkPalette = [
      "#FFD700",
      "#FFA500",
      "#C0C0C0",
      "#E8E8E8",
      "#FFEC8B",
      "#DAA520",
    ];
    var vBlastColors = ["#FFC0CB", "#FF69B4", "#FF1493", "#C71585"];

    // --- 1. Initial V-Blast: two simultaneous bursts (hearts) from bottom-left and bottom-right ---
    if (typeof confetti === "function") {
      var heartShape =
        typeof confetti.shapeFromPath === "function"
          ? confetti.shapeFromPath({
              path: "M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z",
              matrix: [
                0.03333333333333333,
                0,
                0,
                0.03333333333333333,
                -5.566666666666666,
                -5.533333333333333,
              ],
            })
          : "circle";

      var vBlastBase = {
        particleCount: 180,
        spread: 95,
        startVelocity: 60,
        ticks: 260,
        decay: 0.92,
        scalar: 1.35,
        shapes: [heartShape],
        colors: vBlastColors,
      };
      confetti({
        ...vBlastBase,
        origin: { x: 0, y: 1 },
        angle: 60,
      });
      confetti({
        ...vBlastBase,
        origin: { x: 1, y: 1 },
        angle: 120,
      });
    }

    // --- 2. Constant Rain: start after initial blast peaks (~2s) ---
    setTimeout(function () {
      startConstantRain(darkPalette);
    }, 1500);

    // --- 3. After confetti explodes: hide cake, show envelope entrance ---
    setTimeout(function () {
      var cakeEl = document.querySelector(".cake");
      var envelopeStage = document.getElementById("envelope-stage");
      var hintAdd = document.getElementById("hint-add-candles");
      var hintBlow = document.getElementById("hint-blow");
      var hintEnvelope = document.getElementById("hint-click-envelope");
      if (cakeEl) cakeEl.classList.add("hidden");
      if (hintAdd) hintAdd.classList.add("hint--hidden");
      if (hintBlow) hintBlow.classList.add("hint--hidden");
      if (hintEnvelope) hintEnvelope.classList.remove("hint--hidden");
      if (envelopeStage) {
        envelopeStage.classList.add("visible");
        envelopeStage.setAttribute("aria-hidden", "false");
      }
    }, 2200);

  }

  function startConstantRain(colors) {
    var duration = 15 * 1000;
    var animationEnd = Date.now() + duration;
    var skew = 1;

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    function frame() {
      var timeLeft = animationEnd - Date.now();
      var ticks = Math.max(200, 500 * (timeLeft / duration));
      skew = Math.max(0.8, skew - 0.001);

      if (typeof confetti === "function") {
        confetti({
          particleCount: 1,
          startVelocity: 0,
          ticks: ticks,
          origin: {
            x: Math.random(),
            y: Math.random() * skew - 0.2,
          },
          colors: colors.length ? colors : ["#FFFFFF", "#FFD700", "#C0C0C0"],
          shapes: ["circle"],
          gravity: randomInRange(0.4, 0.6),
          scalar: randomInRange(0.4, 1),
          drift: randomInRange(-0.4, 0.4),
        });
      }

      if (timeLeft > 0) {
        requestAnimationFrame(frame);
      }
    }
    frame();

    // tsParticles snowfall layer (gold/silver)
    if (typeof tsParticles !== "undefined" && tsParticles.load) {
      tsParticles.load({
        id: "tsparticles",
        options: {
          fullScreen: { enable: true, zIndex: 0 },
          particles: {
          color: {
            value: ["#FFFFFF", "#FFD700", "#FFA500", "#C0C0C0", "#E8E8E8"],
          },
          move: {
            direction: "bottom",
            enable: true,
            outModes: { default: "out" },
            size: true,
            speed: { min: 1, max: 3 },
          },
          number: {
            value: 500,
            density: { enable: true, area: 800 },
          },
          opacity: {
            value: 1,
            animation: { enable: false },
          },
          rotate: {
            value: { min: 0, max: 360 },
            direction: "random",
            move: true,
            animation: { enable: true, speed: 60 },
          },
          tilt: {
            direction: "random",
            enable: true,
            move: true,
            value: { min: 0, max: 360 },
            animation: { enable: true, speed: 60 },
          },
          shape: {
            type: ["circle", "square"],
            options: {},
          },
          size: { value: { min: 2, max: 4 } },
          roll: {
            darken: { enable: true, value: 30 },
            enlighten: { enable: true, value: 30 },
            enable: true,
            speed: { min: 15, max: 25 },
          },
          wobble: {
            distance: 30,
            enable: true,
            move: true,
            speed: { min: -15, max: 15 },
          },
        },
        },
      });
    }
  }

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
      })
      .catch(function (err) {
        console.log("Unable to access microphone: " + err);
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }

  // Apply initial lighting state (0 candles = dark room)
  updateCandleCount();

  // Recompute glow radius on resize so edge stays soft at any screen size
  window.addEventListener("resize", updateCandleCount);
});
