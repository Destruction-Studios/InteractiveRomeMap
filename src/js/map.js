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
//Zooming->Touch
let lastTouchDistance = 0;

//Tooltip
let currentHover = null;
let currentTooltipText = null;
let lastHovered = 0;
let tCurrentX = 0;
let tCurrentY = 0;
let tTargetX = 0;
let tTargetY = 0;

//Pins
const PIN_SCALE = 0.25;
let allMapPins = [];

const lerp = (a, b, t) => a + (b - a) * t;

svg.addEventListener("mousedown", (e) => {
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

svg.addEventListener("touchstart", (e) => {
  console.log(e.touches);
  if (e.touches.length === 1) {
    isDragging = true;
    startX = e.touches[0].clientX - currentX;
    startY = e.touches[0].clientY - currentY;
  } else if (e.touches.length === 2) {
    lastTouchDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    );
  }
});

svg.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();

    if (e.touches.length === 1 && isDragging) {
      targetX = e.touches[0].clientX - startX;
      targetY = e.touches[0].clientY - startY;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.hypot(dx, dy);

      const zoom = distance / lastTouchDistance;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, targetZoom * zoom));

      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      const pt = svg.createSVGPoint();
      pt.x = midX;
      pt.y = midY;
      const svgPoint = pt.matrixTransform(svg.getScreenCTM().inverse());

      targetX = svgPoint.x - (svgPoint.x - targetX) * (newZoom / targetZoom);
      targetY = svgPoint.y - (svgPoint.y - targetY) * (newZoom / targetZoom);

      targetZoom = newZoom;
      lastTouchDistance = distance;
    }
  },
  { passive: false },
);

svg.addEventListener("touchend", (e) => {
  if (e.touches.length === 1) {
    isDragging = false;
  } else if (e.touches.length === 2) {
    // if one finger remains, switch to drag
    startX = e.touches[0].clientX - currentX;
    startY = e.touches[0].clientY - currentY;
    isDragging = true;
  }
});

function loadTooltips() {
  const mapSelection = document.querySelectorAll(".map-tooltip");

  mapSelection.forEach((item) => {
    const loc = item.dataset.location;
    const tooltip = item.dataset.tooltip || loc;
    item.addEventListener("mouseenter", (e) => {
      currentHover = loc;
      currentTooltipText = tooltip;
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
  return fetch("/assets/map.txt")
    .then((r) => r.text())
    .then((r) => {
      // console.log(r);
      content.innerHTML = r;
    });
}

function loadMapLocations() {
  return fetch("/map_pins.json")
    .then((r) => r.json())
    .then((mapPins) => {
      const viewBox = svg.viewBox.baseVal;
      const vbWidth = viewBox.width;
      const vbHeight = viewBox.height;

      for (const [name, loc] of Object.entries(mapPins)) {
        const x = (loc.x / 100) * vbWidth;
        const y = (loc.y / 100) * vbHeight;

        const pin = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "use",
        );
        const pinWidth = 24 * PIN_SCALE;
        const pinHeight = 32 * PIN_SCALE;

        pin.setAttribute("href", "#map-pin");

        pin.setAttribute("x", x - pinWidth / 2);
        pin.setAttribute("y", y - pinHeight);
        pin.setAttribute("width", pinWidth);
        pin.setAttribute("height", pinHeight);

        pin.dataset.location = name;
        pin.dataset.tooltip = loc.tooltip || "no tooltip";
        pin.classList.add("map-pin");
        pin.classList.add("map-location");
        pin.classList.add("map-tooltip");
        content.append(pin);

        allMapPins.push({
          element: pin,
          zoom: loc.zoom,
          visible: true,
        });
      }
    });
}

function handlePinZoom() {
  // console.log(currentZoom);
  for (const pin of allMapPins) {
    if (pin.zoom != null)
      targetZoom >= pin.zoom
        ? !pin.visible &&
          ((pin.element.style.opacity = "1"),
          (pin.visible = true),
          (pin.element.style.pointerEvents = ""))
        : pin.visible &&
          ((pin.element.style.opacity = "0"),
          (pin.visible = false),
          (pin.element.style.pointerEvents = "none"));
  }
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
    tooltip.innerText = currentTooltipText;
    tooltip.style.left = `${tCurrentX}px`;
    tooltip.style.top = `${tCurrentY}px`;
  }

  handlePinZoom();

  requestAnimationFrame(animateStuff);
}

if (location.hostname === "localhost") {
  svg.addEventListener("click", (e) => {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const svgPoint = pt.matrixTransform(content.getCTM().inverse());

    const viewBox = svg.viewBox.baseVal;

    const percentX = (svgPoint.x / viewBox.width) * 100;
    const percentY = (svgPoint.y / viewBox.height) * 100;

    console.log(`"x": ${percentX.toFixed(2)}, "y": ${percentY.toFixed(2)}`);
  });
}

export const mapReady = loadMap()
  // .then(loadPinSymbol)
  .then(loadMapLocations)
  .then(loadTooltips)
  .finally(animateStuff);
