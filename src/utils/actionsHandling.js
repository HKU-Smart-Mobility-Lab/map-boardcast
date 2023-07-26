import { ActionType } from "../data/actions";
import { createPulsingDot } from "./passengersHandling";
import { driverNaming, passengerNaming } from "./naming";
import { DriverStatus, updateDriverStatus } from "./driversHandling";
import { mapConfig } from "../config";

export const actionsHandling = (
  map,
  actionType,
  data,
  currentTime,
  driverRoutes
) => {
  switch (actionType) {
    case ActionType.passengerAppear:
      console.log(actionType, data);
      passengerAppear(map, data);
      break;
    case ActionType.rangeUpdate:
      console.log(actionType, data);
      rangeUpdate(map, data);
      break;
    case ActionType.orderReceived:
      orderReceived(map, data, currentTime, driverRoutes);
      break;
    case ActionType.pickUp:
      pickUp(map, data);
      break;
    case ActionType.dropOff:
      dropOff(map, data);
      break;
    case ActionType.cancel:
      cancel(map, data);
      break;
    default:
      console.error("No such action type");
  }
};

function passengerAppear(map, data) {
  /*
   * data format: 
   * {
      passengerid: 1,
      passengerCoordinates: [114.1694, 22.3193],
      range: 300,
    };
  */
  const passenger = data;
  const { imageName, sourceName, layerName } = passengerNaming(
    passenger.passengerid
  );

  if (map.getLayer(layerName)) map.removeLayer(layerName);
  if (map.getSource(sourceName)) map.removeSource(sourceName);
  if (map.hasImage(imageName)) map.removeImage(imageName);

  map.addImage(imageName, createPulsingDot(passenger.range, map), {
    pixelRatio: 2,
  });

  map.addSource(sourceName, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: passenger.passengerCoordinates,
          },
        },
      ],
    },
  });

  map.addLayer({
    id: layerName,
    type: "symbol",
    source: sourceName,
    layout: {
      "icon-image": imageName,
    },
  });
}

function rangeUpdate(map, data) {
  /*
   * data format: 
   * {
      passengerid: 1,
      passengerCoordinates: [114.1694, 22.3193],
      newRange: 300,
    };
  */
  const passengerLayerName = passengerNaming(data.passengerid).layerName;
  map.removeLayer(passengerLayerName);
  passengerAppear(map, data);
}

function pickUp(map, data) {
  /*
   * data format: 
   * {
      passengerid: 1,
      driverid: 17,
    };
  */
  const passengerLayerName = passengerNaming(data.passengerid).layerName;
  map.removeLayer(passengerLayerName);
  updateDriverStatus(map, data.driverid, DriverStatus.drivingToDropoff);
}

function dropOff(map, data) {
  /*
   * data format: 
   * {
      driverid: 17,
    };
  */
  const { driverPickingUpRouteSourceName, driverPickingUpRouteLayerName } =
    driverNaming(data.driverid);
  updateDriverStatus(map, data.driverid, DriverStatus.idle);
  map.removeSource(driverPickingUpRouteSourceName);
  map.removeLayer(driverPickingUpRouteLayerName);
}

function cancel(map, data) {
  /*
   * data format: 
   * {
      passengerid: 1,
      driverid: 17,
    };
  */
  const { driverPickingUpRouteSourceName, driverPickingUpRouteLayerName } =
    driverNaming(data.driverid);
  updateDriverStatus(map, data.driverid, DriverStatus.idle);
  map.removeSource(driverPickingUpRouteSourceName);
  map.removeLayer(driverPickingUpRouteLayerName);
}

function orderReceived(map, data, currentTime, driverRoutes) {
  /*
   * data format: 
   * {
      passengerid: 1,
      driverid: 17,
      pickUpTime: 30,
    };
  */
  const { driverPickingUpRouteSourceName, driverPickingUpRouteLayerName } =
    driverNaming(data.driverid);
  const startIndex = currentTime;
  const endIndex = data.pickUpTime;

  const arc = driverRoutes[data.driverid].features[0].geometry.coordinates
    .slice(startIndex, endIndex * mapConfig.carMovingStepsPerTimeInterval)
    .reverse();

  const _pickUpRoute = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: arc,
        },
      },
    ],
  };
  map.addSource(driverPickingUpRouteSourceName, {
    type: "geojson",
    data: _pickUpRoute,
  });
  map.addLayer({
    id: driverPickingUpRouteLayerName,
    source: driverPickingUpRouteSourceName,
    type: "line",
    paint: {
      "line-width": 2,
      "line-color": "#007cbf",
    },
  });
  updateDriverStatus(map, data.driverid, DriverStatus.drivingToPickup);
}
