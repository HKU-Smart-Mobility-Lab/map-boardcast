import { driverNaming } from "./naming";

export const DriverStatus = {
  idle: "carIdleIcon",
  drivingToPickup: "carDrivingToPickupIcon",
  drivingToDropoff: "carDrivingToDropoffIcon",
};

export const updateDriverStatus = (map, driverid, newStatus) => {
  const { driverLayerName } = driverNaming(driverid);
  map.setLayoutProperty(driverLayerName, "icon-image", newStatus);
};
