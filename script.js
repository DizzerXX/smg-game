import { Wheel } from "https://cdn.jsdelivr.net/npm/spin-wheel@5.0.2/dist/spin-wheel-esm.js";



const confetti = document.getElementById('confetti');
const jsConfettiInstance = new JSConfetti({ confetti });
const grandPrizeSound = document.getElementById('grand-prize-sound');
const secondPrizeSound = document.getElementById('second-prize-sound');
const consolationPrizeSound = document.getElementById('consolation-prize-sound');
const sadPrizeSound = document.getElementById('sad-prize-sound');


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
        title: "myStarJob Spin Wheel Game",
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
      }
    };

    wheel.onRest = (e) => {
      
      const prize = gameData[e.currentIndex];
      if (prize.quantity > 0) {
        
        showPrize(prize);
        playEffect(prize);
      } else {
        
        showNoPrize();
      }
    }
  }

  function spinWheel() {
    if (!wheel || isSpinning) return;
    isSpinning = true;
    document.getElementById("spin-button").disabled = true;

    
    const availablePrizes = gameData.filter(item => item.quantity > 0);
    if (availablePrizes.length === 0) {
      showNoPrize()
      sadPrizeSound.play()
      isSpinning = false;
      document.getElementById("spin-button").disabled = false;
      return;
    }

    const totalWeight = availablePrizes.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedPrize = availablePrizes[0];

    for (let i = 0; i < availablePrizes.length; i++) {
      random -= availablePrizes[i].weight;
      if (random <= 0) {
        selectedPrize = availablePrizes[i];
        break;
      }
    }

    const selectedIndex = gameData.findIndex(item => item.label === selectedPrize.label);
    wheel.spinToItem(selectedIndex, 4000, true, 2, 1);
  }

  function showPrize(prize) {
    const lang = document.documentElement.lang;
    const prizeText = lang === "en" ? "You won: " : "Anda menang: ";
    const prizeDisplay = document.getElementById("prize-display");
    

    prizeDisplay.innerHTML = `
      ${prizeText}${prize.label}
      <br>
      <img src="${prize.image}" alt="${prize.label}" height="200">
    `;

    
    prize.quantity--;  
    saveGameData();     
  }

  function showNoPrize() {
    const lang = document.documentElement.lang;
    const noPrizeText = lang === "en" ? "No prize available. Try again next time!" : "Tiada hadiah tersedia. Cuba lagi!";
    const prizeDisplay = document.getElementById("prize-display");

    prizeDisplay.innerHTML = `
      <p>${noPrizeText}</p>
    `;
  }


  function playEffect(prizeLabel) {
    console.log(prizeLabel);

    
    jsConfettiInstance.addConfetti({
      confettiColors: ['#ff0000', '#00ff00', '#0000ff'], 
      confettiNumber: 150, 
      confettiShape: 'circle', 
      confettiWidth: 5, 
      confettiHeight: 5, 
    });

    
    let sound;

    if (prizeLabel.tier === "grand") {
      sound = grandPrizeSound;
      grandPrizeSound.play()
    } else if (prizeLabel.tier === "secondary") {
      sound = secondPrizeSound;
      secondPrizeSound.play()
    } else if (prizeLabel.tier === "consolation") {
      sound = consolationPrizeSound;
      consolationPrizeSound.play()
    }

    
    if (sound) {
      sound.play().catch((error) => {
        console.error("Error playing sound:", error);
      });
    }
}



  function saveGameData() {
    
    
  }

  updateText();
});
