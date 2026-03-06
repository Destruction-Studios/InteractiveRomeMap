import { resetMap, setOnlyPinGlow } from "./map";
import { waitForNextButton } from "./sidebar";

let isInTour = false;

function changeTab(tab) {
  window.location.hash = tab;
  resetMap();
}

export async function startTour() {
  if (isInTour) return;
  isInTour = true;

  console.log("Starting tour");

  const stops = [
    "antium",
    "germania",
    "capraea",
    "rome",
    "palatine-hill",
    "temple",
    "t-jew",
  ];

  for (const stop of stops) {
    changeTab(stop);
    setOnlyPinGlow(stop);

    await waitForNextButton();
  }
  changeTab("p-hill-a");
  setOnlyPinGlow("palatine-hill");
  await waitForNextButton();
  setOnlyPinGlow();
  changeTab("tour-end");
}

export function getIsInTour() {
  return isInTour;
}
