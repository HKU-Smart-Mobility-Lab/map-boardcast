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
  ],
};
