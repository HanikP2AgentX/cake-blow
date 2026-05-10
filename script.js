document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  const celebrateText = document.getElementById("celebrateText");
  const confetti = document.getElementById("confetti");
  const affectionMessage = document.getElementById("affectionMessage");
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;
  let hasCelebrated = false;

  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
    candleCountDisplay.textContent = activeCandles;

    if (candles.length > 0 && activeCandles === 0) {
      celebrate();
    }
  }

  function celebrate() {
    if (hasCelebrated) return;
    hasCelebrated = true;

    celebrateText.classList.remove("hidden");
    affectionMessage.textContent =
      "You are deeply loved. May every new year bring brighter smiles and beautiful memories.";
    confetti.classList.add("show");

    setTimeout(() => {
      confetti.classList.remove("show");
    }, 3000);
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
    hasCelebrated = false;
    celebrateText.classList.add("hidden");
    updateCandleCount();
  }

  cake.addEventListener("click", function (event) {
    const rect = cake.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    addCandle(left, top);
  });

  function addInitialCandles(count) {
    // Pyramid-style layout keeps all candles visible on the icing.
    const rows = [5, 4, 3, 2, 1];
    const centerX = 125;
    const rowStartY = -8;
    const rowGap = 9;
    const rowWidths = [168, 136, 106, 78, 48];

    let placed = 0;
    for (let r = 0; r < rows.length && placed < count; r++) {
      const candlesInRow = rows[r];
      const width = rowWidths[r];
      const y = rowStartY + r * rowGap;

      for (let c = 0; c < candlesInRow && placed < count; c++) {
        const t = candlesInRow === 1 ? 0.5 : c / (candlesInRow - 1);
        const x = centerX - width / 2 + width * t;
        addCandle(x, y);
        placed++;
      }
    }
  }

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
    if (!candles.length) return;
    let blownOut = 0;

    if (isBlowing()) {
      candles.forEach((candle) => {
        if (!candle.classList.contains("out") && Math.random() > 0.35) {
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

  addInitialCandles(15);
});
