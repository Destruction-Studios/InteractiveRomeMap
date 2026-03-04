import { resetMap, setPinGlow } from "./map";
import { setTab, waitForNextButton } from "./sidebar";

let isInTour = false;

const tourLocations = {};

function changeTab(tab) {
  //   window.location.hash = tab;
  resetMap();
  setTab(tab);
}

export async function startTour() {
  if (isInTour) return;
  isInTour = true;
  console.log("Starting tour");
  changeTab("antium");
  setPinGlow("antium", true);

  await waitForNextButton();

  setPinGlow("antium", false);
  changeTab("two");
}

export function getIsInTour() {
  return isInTour;
}
