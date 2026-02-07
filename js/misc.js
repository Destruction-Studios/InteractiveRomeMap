const linkItems = document.querySelectorAll(".linkable-text");

linkItems.forEach((item) => {
  const url = item.dataset.url;
  item.addEventListener("click", () => {
    window.open(url, "_blank");
  });
});
