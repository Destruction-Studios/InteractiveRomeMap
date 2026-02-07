const sidebar = document.getElementById("sidebar");
const resizer = document.getElementById("sidebar-resizer");

const MIN_SIZE = 175;
const MAX_SIZE = 500;

let isResizing = false;

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
