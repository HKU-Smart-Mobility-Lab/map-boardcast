export const passengerNaming = (passengerId) => {
  const imageName = `passenger-pulsing-image-${passengerId}`;
  const sourceName = `dot-dot-${passengerId}`;
  const layerName = `layer-${passengerId}`;
  return { imageName, sourceName, layerName };
};

export const driverNaming = (driverId) => {
  const driverSourceName = `driver-source-${driverId}`;
  const driverLayerName = `driver-layer-${driverId}`;
  const driverPickingUpRouteLayerName = `driver-picking-up-route-layer-${driverId}`;
  const driverPickingUpRouteSourceName = `driver-picking-up-route-${driverId}`;
  return {
    driverSourceName,
    driverLayerName,
    driverPickingUpRouteLayerName,
    driverPickingUpRouteSourceName,
  };
};
