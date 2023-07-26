export const ActionType = {
  passengerAppear: "passengerAppear",
  rangeUpdate: "rangeUpdate",
  orderReceived: "orderReceived",
  pickUp: "pickUp",
  dropOff: "dropOff",
  cancel: "cancel",
};

export const mapActions = {
  3: [
    {
      actionType: ActionType.passengerAppear,
      data: {
        passengerid: 1,
        passengerCoordinates: [114.1694, 22.3193],
        range: 300,
      },
    },
  ],
  9: [
    {
      actionType: ActionType.passengerAppear,
      data: {
        passengerid: 2,
        passengerCoordinates: [114.1794, 22.3203],
        range: 200,
      },
    },
    {
      actionType: ActionType.passengerAppear,
      data: {
        passengerid: 1,
        passengerCoordinates: [114.1694, 22.3193],
        range: 900,
      },
    },
    {
      actionType: ActionType.orderReceived,
      data: {
        passengerid: 1,
        driverid: 0,
        pickUpTime: 17,
      },
    },
  ],
  17: [
    {
      actionType: ActionType.pickUp,
      data: {
        passengerid: 1,
        driverid: 0,
      },
    },
  ],
  20: [
    {
      actionType: ActionType.dropOff,
      data: {
        driverid: 0,
        passengerid: 1,
      },
    },
  ],
};
