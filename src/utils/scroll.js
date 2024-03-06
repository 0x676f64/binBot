// Define variables
let currentIndex = 0;
const gameBoxes = document.querySelectorAll('.game-box');
const totalGames = gameBoxes.length;
const scrollerLeft = document.querySelector('.scroller-icon.left');
const scrollerRight = document.querySelector('.scroller-icon.right');

// Function to show the current set of games
const showGames = () => {
  gameBoxes.forEach((box, index) => {
    if (index >= currentIndex && index < currentIndex + 3) {
      box.style.display = 'block';
    } else {
      box.style.display = 'none';
    }
  });
};

// Function to handle left scrolling
const scrollLeft = () => {
  if (currentIndex > 0) {
    currentIndex--;
    showGames();
  }
};

// Function to handle right scrolling
const scrollRight = () => {
  if (currentIndex + 3 < totalGames) {
    currentIndex++;
    showGames();
  }
};

// Event listeners for scroller buttons
scrollerLeft.addEventListener('click', scrollLeft);
scrollerRight.addEventListener('click', scrollRight);

// Initial display of games
showGames();

