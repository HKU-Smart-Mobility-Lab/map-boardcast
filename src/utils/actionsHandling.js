import { ActionType } from "../data/actions";
import { createPulsingDot } from "./layers";
import { passengerNaming } from "./naming";

export const actionsHandling = (map, actionType, data) => {
  switch (actionType) {
    case ActionType.passengerAppear:
      console.log(actionType, data);
      passengerAppear(map, data);
      break;
    case ActionType.rangeUpdate:
      break;
    case ActionType.orderReceived:
      break;
    case ActionType.pickUp:
      break;
    case ActionType.dropOff:
      break;
    case ActionType.cancel:
      break;
    default:
      console.error("No such action type");
  }
};

function passengerAppear(map, data) {
  /** 
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

const rangeUpdateAction = {
  passengerid: 1,
  passengerCoordinates: [114.1694, 22.3193],
  newRange: 300,
};

const orderReceivedAction = {
  passengerid: 1,
  driverid: 17,
  pickUpTime: 30,
};

const pickUpAction = {
  passengerid: 1,
  driverid: 17,
};

const dropOffAction = {
  driverid: 17,
};

const cancelAction = {
  passengerid: 1,
  driverid: 17,
};

const actions = {
  1: [
    {
      actionType: "rangeUpdate",
      data: rangeUpdateAction,
    },
    {
      actionType: "orderReceived",
      data: orderReceivedAction,
    },
  ],
  2: [
    {
      actionType: "pickUp",
      data: pickUpAction,
    },
  ],
};
