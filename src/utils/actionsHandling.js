import { ActionType } from "../data/actions";
import { createPulsingDot } from "./passengersHandling";
import { passengerNaming } from "./naming";
import { DriverStatus, updateDriverStatus } from "./driversHandling";

export const actionsHandling = (map, actionType, data) => {
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
      orderReceived(map, data);
      break;
    case ActionType.pickUp:
      pickUp(map, data);
      break;
    case ActionType.dropOff:
      dropOff(map, data);
      break;
    case ActionType.cancel:
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
  updateDriverStatus(map, data.driverid, DriverStatus.idle);
}

const cancelAction = {
  passengerid: 1,
  driverid: 17,
};

function orderReceived(map, data) {
  /*
   * data format: 
   * {
      passengerid: 1,
      driverid: 17,
      pickUpTime: 30,
    };
  */
  updateDriverStatus(map, data.driverid, DriverStatus.drivingToPickup);
}
