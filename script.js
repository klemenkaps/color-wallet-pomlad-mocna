// PASSWORD (CHANGE THIS)
const PASSWORD = "bs-2604";

// elements
const loginScreen = document.getElementById("loginScreen");
const appContent = document.getElementById("appContent");
const wasUnlockedOnStartup = localStorage.getItem("unlocked") === "true";
let isHoldingTintLogoUntilLoad = wasUnlockedOnStartup && document.readyState !== "complete";

// check if already unlocked
if (wasUnlockedOnStartup) {
  loginScreen.style.display = "none";
  appContent.style.display = "flex";
  requestAnimationFrame(syncTintLogoPosition);
}

// password function
function checkPassword() {
  const input = document.getElementById("passwordInput").value;

  if (input === PASSWORD) {
    localStorage.setItem("unlocked", "true");

    loginScreen.style.display = "none";
    appContent.style.display = "flex";

    isHoldingTintLogoUntilLoad = document.readyState !== "complete";

    requestAnimationFrame(() => {
      syncTintLogoPosition();
    });
  } else {
    alert("Wrong password");
  }
}

const colors = [
  "#392621", "#49312F", "#68403E", "#5B443B", "#C5AEA2", "#DAD4CD",
  "#F05032", "#FFF2D5", "#F03C47", "#F04E5B", "#F16770", "#F58C90",
  "#F8AEB2", "#FCF4DD", "#EF2B26", "#F17489", "#FCD9D1", "#FEF407",
  "#F9F5A7", "#C7BBA4", "#75C382", "#27B77C", "#17A96A", "#3AB768",
  "#08B9AB", "#46C1BD", "#2CC4F4", "#6DD0F6", "#1AA1DB", "#3E7CBF",
  "#2A5CAA", "#4F6DB3", "#6F5EA9", "#8372B4", "#B775B1", "#923594",
  "#8C51A0", "#D43A95", "#E15990", "#F595B8"
];

const grid = document.getElementById("grid");
const fullscreen = document.getElementById("fullscreen");
const closeBtn = document.getElementById("close");
const layoutToggle = document.getElementById("layoutToggle");
const layoutScreen = document.getElementById("layoutScreen");
const layoutStripes = document.getElementById("layoutStripes");
const layoutClose = document.getElementById("layoutClose");
const logoSpinButton = document.getElementById("logoSpinButton");
const homeTintAnchor = document.getElementById("homeTintAnchor");
const centerTintAnchor = document.getElementById("centerTintAnchor");
const sharedTintLogo = document.getElementById("sharedTintLogo");
const clientLogo = document.getElementById("clientLogo");
const themeColorMeta = document.getElementById("themeColorMeta");
const defaultThemeColor = "#000000";

let currentIndex = 0;
let isLayoutOpen = false;
let isFullscreenOpen = false;
let tintLogoAnimationTimeoutId = 0;

function animateTintLogoPositionUpdate(updateFn) {
  sharedTintLogo.classList.add("is-animated");
  updateFn();
  clearTimeout(tintLogoAnimationTimeoutId);
  tintLogoAnimationTimeoutId = window.setTimeout(() => {
    sharedTintLogo.classList.remove("is-animated");
  }, 650);
}

function setThemeColor(color) {
  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", color);
  }
}

// create swatches
colors.forEach((color, index) => {
  const div = document.createElement("div");
  div.className = "swatch";
  div.style.background = color;

  div.onclick = () => openFullscreen(index);

  grid.appendChild(div);
});

colors.forEach((color) => {
  const stripe = document.createElement("div");
  stripe.className = "layout-stripe";
  stripe.style.background = color;
  layoutStripes.appendChild(stripe);
});

function applyTintLogoPosition(target) {
  const homeRect = homeTintAnchor.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const zimaRect = clientLogo.getBoundingClientRect();
  const tintHeight = sharedTintLogo.getBoundingClientRect().height;
  const x = target === centerTintAnchor
    ? targetRect.left
    : homeRect.left;
  const y = (zimaRect.top + (zimaRect.height / 2)) - (tintHeight / 2);

  sharedTintLogo.style.transform = `translate(${x}px, ${y}px)`;
  sharedTintLogo.style.opacity = isHoldingTintLogoUntilLoad ? "0" : "1";
}

function syncTintLogoPosition() {
  if (loginScreen.style.display !== "none") {
    sharedTintLogo.style.opacity = "0";
    return;
  }

  const target = (isLayoutOpen || isFullscreenOpen) ? centerTintAnchor : homeTintAnchor;
  layoutToggle.style.transform = "none";
  const buttonRect = layoutToggle.getBoundingClientRect();
  const zimaRect = clientLogo.getBoundingClientRect();
  const sideTop = zimaRect.top + (zimaRect.height / 2) - (buttonRect.height / 2);

  layoutToggle.style.transform = `translateY(${sideTop - buttonRect.top}px)`;
  applyTintLogoPosition(target);
}

function openFullscreen(index) {
  currentIndex = index;
  isFullscreenOpen = true;
  fullscreen.style.display = "block";
  fullscreen.style.background = colors[index];
  setThemeColor(colors[index]);

  requestAnimationFrame(() => {
    fullscreen.style.opacity = "1";
    animateTintLogoPositionUpdate(syncTintLogoPosition);
  });
}

closeBtn.onclick = () => {
  isFullscreenOpen = false;
  setThemeColor(defaultThemeColor);
  animateTintLogoPositionUpdate(syncTintLogoPosition);
  fullscreen.style.opacity = "0";

  setTimeout(() => {
    fullscreen.style.display = "none";
    syncTintLogoPosition();
  }, 250);
};

layoutToggle.onclick = () => {
  applyTintLogoPosition(homeTintAnchor);
  layoutScreen.classList.add("is-visible");
  isLayoutOpen = true;

  requestAnimationFrame(() => {
    layoutScreen.style.opacity = "1";
    animateTintLogoPositionUpdate(syncTintLogoPosition);
  });
};

layoutClose.onclick = () => {
  isLayoutOpen = false;
  animateTintLogoPositionUpdate(syncTintLogoPosition);
  layoutScreen.style.opacity = "0";

  setTimeout(() => {
    layoutScreen.classList.remove("is-visible");
    syncTintLogoPosition();
  }, 250);
};

logoSpinButton.onclick = () => {
  clientLogo.classList.remove("is-spinning");
  void clientLogo.offsetWidth;
  clientLogo.classList.add("is-spinning");
};

clientLogo.addEventListener("animationend", () => {
  clientLogo.classList.remove("is-spinning");
});

// swipe support
let startX = 0;

fullscreen.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

fullscreen.addEventListener("touchend", (e) => {
  let endX = e.changedTouches[0].clientX;

  if (startX - endX > 50) nextColor();
  if (endX - startX > 50) prevColor();
});

function nextColor() {
  currentIndex = (currentIndex + 1) % colors.length;
  fullscreen.style.background = colors[currentIndex];
  setThemeColor(colors[currentIndex]);
}

function prevColor() {
  currentIndex = (currentIndex - 1 + colors.length) % colors.length;
  fullscreen.style.background = colors[currentIndex];
  setThemeColor(colors[currentIndex]);
}

window.addEventListener("resize", syncTintLogoPosition);
window.addEventListener("load", () => {
  isHoldingTintLogoUntilLoad = false;
  syncTintLogoPosition();
});
