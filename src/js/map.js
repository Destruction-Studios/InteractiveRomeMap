const svg = document.getElementById("map");
const content = document.getElementById("map-contents");
const tooltip = document.getElementById("tooltip");

const LERP = 0.15;

let mouseX = 0;
let mouseY = 0;

// Dragging
let isDragging = false;

let startX = 0;
let startY = 0;

let currentX = 0;
let currentY = 0;
let targetX = 0;
let targetY = 0;

//Zooming
let currentZoom = 1;
let targetZoom = 1;
const MIN_ZOOM = 0.8;
const MAX_ZOOM = 5.5;
const ZOOM_SPEED = 0.001;

//Tooltip
let currentHover = null;
let lastHovered = 0;
let tCurrentX = 0;
let tCurrentY = 0;
let tTargetX = 0;
let tTargetY = 0;

const lerp = (a, b, t) => a + (b - a) * t;

svg.addEventListener("mousedown", (e) => {
  console.log("Start drag map");
  isDragging = true;
  startX = e.clientX - currentX;
  startY = e.clientY - currentY;
});

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  if (!isDragging) return;

  targetX = e.clientX - startX;
  targetY = e.clientY - startY;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

svg.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();

    const zoom = Math.exp(-e.deltaY * ZOOM_SPEED);
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, targetZoom * zoom));

    const pt = svg.createSVGPoint();

    pt.x = e.clientX;
    pt.y = e.clientY;

    const svgPoint = pt.matrixTransform(svg.getScreenCTM().inverse());

    targetX = svgPoint.x - (svgPoint.x - targetX) * (newZoom / targetZoom);
    targetY = svgPoint.y - (svgPoint.y - targetY) * (newZoom / targetZoom);

    targetZoom = newZoom;
  },
  { passive: false },
);

function afterMapLoaded() {
  const mapSelection = document.querySelectorAll("#map-i a");

  mapSelection.forEach((item) => {
    const loc = (currentHover = item.dataset.location);
    item.addEventListener("mouseenter", (e) => {
      currentHover = loc;
      tCurrentX = e.clientX + 12;
      tCurrentY = e.clientY + 12;
    });

    item.addEventListener("mouseleave", (e) => {
      if (currentHover == loc) {
        currentHover = null;
      }
    });
  });
}

function loadMap() {
  fetch("/map.txt")
    .then((r) => r.text())
    .then((r) => {
      // console.log(r);
      content.innerHTML = r;
    })
    .finally(afterMapLoaded);
}

function animateStuff() {
  currentX = lerp(currentX, targetX, LERP);
  currentY = lerp(currentY, targetY, LERP);
  tCurrentX = lerp(tCurrentX, tTargetX, LERP);
  tCurrentY = lerp(tCurrentY, tTargetY, LERP);
  currentZoom = lerp(currentZoom, targetZoom, LERP);

  content.setAttribute(
    "transform",
    `translate(${currentX}, ${currentY}) scale(${currentZoom})`,
  );

  const now = performance.now();

  tTargetY = mouseY - 24;
  tTargetX = mouseX + 12;

  if (currentHover == null) {
    if (now - lastHovered > 75) {
      tooltip.style.display = "none";
    }
  } else {
    lastHovered = now;

    tooltip.style.display = "";
    tooltip.innerHTML = currentHover;
    tooltip.style.left = `${tCurrentX}px`;
    tooltip.style.top = `${tCurrentY}px`;
  }

  requestAnimationFrame(animateStuff);
}

loadMap();
animateStuff();
