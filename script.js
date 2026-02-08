document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;

  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
    candleCountDisplay.textContent = activeCandles;

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
        if (!candle.classList.contains("out") && Math.random() > 0.5) {
          candle.classList.add("out");
          blownOut++;
        }
      });
    }

    if (blownOut > 0) {
      updateCandleCount();
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
