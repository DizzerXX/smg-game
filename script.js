import { Wheel } from "https://cdn.jsdelivr.net/npm/spin-wheel@5.0.2/dist/spin-wheel-esm.js";

document.addEventListener("DOMContentLoaded", () => {
  let gameData = [];
  let wheel = null;
  let isSpinning = false;

  fetch("./assets/gameData.json")
    .then((response) => response.json())
    .then((data) => {
      gameData = data;
      initializeWheel();
    })
    .catch((error) => console.error("Error loading game data:", error));

  document.getElementById("lang-switch").addEventListener("click", () => {
    const currentLang = document.documentElement.lang;
    const newLang = currentLang === "en" ? "ms" : "en";
    document.documentElement.lang = newLang;
    updateText();

    const flagImg = document.querySelector("#lang-switch img");
    flagImg.src =
      newLang === "en"
        ? "./assets/images/ENG_flag.png"
        : "./assets/images/MAS_flag.png";
  });

  function updateText() {
    const texts = {
      en: {
        title: "myStarJob Spin Wheel Game",
        button: "Spin the Wheel",
        prize: "You won: ",
      },
      ms: {
        title: "Permainan Roda Kemenanganku",
        button: "Putar Roda",
        prize: "Anda menang: ",
      },
    };

    const lang = document.documentElement.lang;
    document.querySelector("header h1").textContent = texts[lang].title;
    document.getElementById("spin-button").textContent = texts[lang].button;
    document.getElementById("prize-display").textContent = texts[lang].prize;
  }

  function initializeWheel() {
    const container = document.querySelector("#spin-wheel");

    if (!container) {
      console.error("Spin wheel container not found!");
      return;
    }

    const images = {};
    gameData.forEach((item) => {
      const img = new Image();
      img.src = item.image;
      images[item.label] = img;
    });

    const totalWeight = gameData.reduce((sum, item) => sum + item.weight, 0);
    let startAngle = 0;
    const wheelItems = gameData.map((item) => {
      const sliceAngle = (item.weight / totalWeight) * 360;
      const wheelItem = {
        label: item.label,
        backgroundColor: item.color,
        image: images[item.label],
        imageRadius: 0.5,
        imageScale: 0.2,
        startAngle: startAngle,
        sliceAngle: sliceAngle,
        weight: item.weight,
      };
      startAngle += sliceAngle;
      return wheelItem;
    });

    console.log(wheelItems);

    const overlayImg = new Image();
    overlayImg.src = "./assets/images/overlay.svg";
    overlayImg.onload = function () {
      wheel.overlayImage = overlayImg;
    };

    const props = {
      items: wheelItems,
      radius: 0.85,
      itemLabelRadius: 0.95,
      itemLabelRotation: 180,
      itemLabelAlign: "left",
      itemLabelColors: ["#fefefe"],
      itemLabelFont: "Arial",
      itemLabelFontSizeMax: 20,
      isInteractive: false,
      rotationSpeedMax: 1000,
      overlayImage: overlayImg,
    };

    wheel = new Wheel(container, props);

    document.getElementById("spin-button").addEventListener("click", () => {
      if (!isSpinning) {
        spinWheel();
      }
    });

    wheel.onCurrentIndexChange = (e) => {
      if (!wheel.isSpinning) {
        isSpinning = false;
        document.getElementById("spin-button").disabled = false;
        const prize = gameData[e.currentIndex];
        const lang = document.documentElement.lang;
        const prizeText = lang === "en" ? "You won: " : "Anda menang: ";
    
        const prizeDisplay = document.getElementById("prize-display");
        prizeDisplay.innerHTML = `
          ${prizeText}${prize.label} 
          <br>
          <img src="${prize.image}" alt="${prize.label}" height="200">
        `;
      }
    };
    
  }

  function spinWheel() {
    if (!wheel || isSpinning) return;
    isSpinning = true;
    document.getElementById("spin-button").disabled = true;

    const totalWeight = gameData.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let i = 0; i < gameData.length; i++) {
      random -= gameData[i].weight;
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    const selectedPrize = gameData[selectedIndex];
    const lang = document.documentElement.lang;
    const prizeText = lang === "en" ? "You will win: " : "Anda akan menang: ";
    document.getElementById(
      "prize-display"
    ).textContent = `${prizeText}${selectedPrize.label}`;

    wheel.spinToItem(selectedIndex, 4000, true, 2, 1);
  }

  updateText();
});
