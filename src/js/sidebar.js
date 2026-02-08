const sidebar = document.getElementById("sidebar");
const resizer = document.getElementById("sidebar-resizer");
const sidebarHeader = document.getElementById("sidebar-header");
const sidebarContent = document.getElementById("sidebar-content");
const sidebarBackButton = document.getElementById("sidebar-back");

const DEFAULT_TAB = "home";

const MIN_SIZE = 175;
const MAX_SIZE = 500;

let currentTab = "home";
let isShowingButton = true;
let isResizing = false;
let sidebarTabs = {};

//Home
const allPages = [];
const allPins = [];

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

function loadPlaceList() {
  return fetch("/map_pins.json")
    .then((r) => r.json())
    .then(async (r) => {
      for (const key in r) {
        const entry = r[key];

        allPins.push({
          name: entry.tooltip,
          hash: key,
        });
      }
    });
}

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

        allPages.push({
          name: entry.header,
          hash: key,
        });
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

function createLocListItem(prop) {
  const li = document.createElement("li");
  const a = document.createElement("a");

  a.textContent = prop.name;
  a.href = `#${prop.hash}`;

  a.classList.add("no-underline");

  li.append(a);

  return li;
}

function setTab(tab) {
  console.log(`Setting tab: ${tab}`);

  let data = sidebarTabs[tab];
  if (data == null) {
    data = sidebarTabs["_error"];
  }

  currentTab = tab;

  sidebarHeader.innerText = data.header;
  sidebarContent.innerHTML = data.contents;

  if (tab === "home") {
    const locList = document.getElementById("location-list");
    const pinList = document.getElementById("place-list");

    allPages.forEach((page) => {
      if (page.hash[0] === "_" || page.hash === "home") {
        return;
      }

      locList.append(createLocListItem(page));
    });
    allPins.forEach((pin) => {
      pinList.append(createLocListItem(pin));
    });
  }
}

function animateStuff() {
  let showBack = true;

  if (currentTab === DEFAULT_TAB) {
    showBack = false;
  }

  // if (sidebarContent.scrollTop > 10) {
  //   showBack = false;
  // }

  if (showBack != isShowingButton) {
    isShowingButton = showBack;
    sidebarBackButton.style.opacity = showBack ? "1" : "0";
    sidebarBackButton.style.pointerEvents = showBack ? "auto" : "none";
  }

  requestAnimationFrame(animateStuff);
}

export async function initSidebar() {
  await loadTabs();
  await loadPlaceList();
  // setupMapLocations();
  onPageHashChange();

  sidebarBackButton.addEventListener("mousedown", () => {
    window.location.hash = DEFAULT_TAB;
  });

  window.addEventListener("hashchange", onPageHashChange);

  animateStuff();
}
