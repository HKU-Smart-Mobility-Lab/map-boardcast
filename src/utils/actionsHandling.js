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
  console.log(actionType, data);
  switch (actionType) {
    case ActionType.passengerAppear:
      for (let i = 0; i < data.length; i++) {
        passengerAppear(map, data[i]);
      }
      break;
    case ActionType.rangeUpdate:
      for (let i = 0; i < data.length; i++) {
        rangeUpdate(map, data[i]);
      }
      break;
    case ActionType.orderReceived:
      for (let i = 0; i < data.length; i++) {
        orderReceived(map, data[i], currentTime, driverRoutes);
      }
      break;
    case ActionType.pickUp:
      for (let i = 0; i < data.length; i++) pickUp(map, data[i]);
      break;
    case ActionType.dropOff:
      for (let i = 0; i < data.length; i++) dropOff(map, data[i]);
      break;
    case ActionType.cancel:
      for (let i = 0; i < data.length; i++) cancel(map, data[i]);
      break;
    default:
      console.error("No such action type ", actionType);
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
  cancel(map, data);
  const { imageName, sourceName, layerName } = passengerNaming(
    passenger.passengerid
  );

  map.addImage(imageName, createPulsingDot(passenger.range * 1000, map), {
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
  map.removeLayer(driverPickingUpRouteLayerName);
  map.removeSource(driverPickingUpRouteSourceName);
}

function cancel(map, data) {
  /*
   * data format: 
   * {
      passengerid: 1,
    };
  */
  const { imageName, sourceName, layerName } = passengerNaming(
    data.passengerid
  );
  if (map.getLayer(layerName)) map.removeLayer(layerName);
  if (map.getSource(sourceName)) map.removeSource(sourceName);
  if (map.hasImage(imageName)) map.removeImage(imageName);
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
