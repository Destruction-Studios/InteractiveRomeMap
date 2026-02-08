const sidebar = document.getElementById("sidebar");
const resizer = document.getElementById("sidebar-resizer");
const sidebarHeader = document.getElementById("sidebar-header");
const sidebarContent = document.getElementById("sidebar-content");

const DEFAULT_TAB = "home";

const MIN_SIZE = 175;
const MAX_SIZE = 500;

let currentTab = "home";

let isResizing = false;
let sidebarTabs = {};

resizer.addEventListener("mousedown", () => {
  isResizing = true;
  document.body.style.cursor = "ew-resize";
  document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", (e) => {
  if (!isResizing) return;

  const newWidth = e.clientX - sidebar.getBoundingClientRect().left;

  if (newWidth >= MIN_SIZE && newWidth <= MAX_SIZE) {
    sidebar.style.width = `${newWidth}px`;
  }
});

document.addEventListener("mouseup", () => {
  if (!isResizing) return;
  isResizing = false;
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
});

function loadTabs() {
  return fetch("/sidebar_profiles/tabs.json")
    .then((r) => r.json())
    .then(async (r) => {
      for (const key in r) {
        const entry = r[key];

        const filePath = `/sidebar_profiles/${key}.html`;

        const htmlRes = await fetch(filePath);
        const html = await htmlRes.text();

        sidebarTabs[key] = {
          header: entry.header,
          contents: html,
        };
      }
    });
}

function onPageHashChange() {
  const hash = window.location.hash.replace("#", "");

  console.log(`Hash changed: ${hash}`);

  if (!hash) {
    setTab(DEFAULT_TAB);
    return;
  }

  setTab(hash.toLowerCase());
}

function setupMapLocations() {
  const mapLocations = document.querySelectorAll(".map-location");

  console.log(mapLocations);

  mapLocations.forEach((mapLoc) => {
    const location = mapLoc.dataset.location;
    mapLoc.addEventListener("mousedown", () => {
      window.location.hash = `${location.toLowerCase()}`;
    });
  });
}

function setTab(tab) {
  console.log(`Setting tab: ${tab}`);

  let data = sidebarTabs[tab];
  if (data == null) {
    data = sidebarTabs["error"];
  }

  sidebarHeader.innerText = data.header;
  sidebarContent.innerHTML = data.contents;
}

export async function initSidebar() {
  await loadTabs();
  setupMapLocations();
  onPageHashChange();

  window.addEventListener("hashchange", onPageHashChange);
}
