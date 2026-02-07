const svg = document.getElementById("map");
const content = document.getElementById("map-g");

const LERP = 0.15;

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

const lerp = (a, b, t) => a + (b - a) * t;

svg.addEventListener("mousedown", (e) => {
  console.log("Start drag map");
  isDragging = true;
  startX = e.clientX - currentX;
  startY = e.clientY - currentY;
});

document.addEventListener("mousemove", (e) => {
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

function animateMap() {
  currentX = lerp(currentX, targetX, LERP);
  currentY = lerp(currentY, targetY, LERP);
  currentZoom = lerp(currentZoom, targetZoom, LERP);

  content.setAttribute(
    "transform",
    `translate(${currentX}, ${currentY}) scale(${currentZoom})`,
  );

  requestAnimationFrame(animateMap);
}

animateMap();
