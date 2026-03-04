let isInTour = false;

const tourLocations = {};

export function startTour() {
  if (isInTour) return;
  isInTour = true;
  console.log("Starting tour");
}

export function getIsInTour() {
  return isInTour;
}
