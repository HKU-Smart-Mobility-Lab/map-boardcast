export const passengerNaming = (passengerId) => {
  const imageName = `passenger-pulsing-image-${passengerId}`;
  const sourceName = `dot-dot-${passengerId}`;
  const layerName = `layer-${passengerId}`;
  return { imageName, sourceName, layerName };
};

export const driverNaming = (driverId) => {};
