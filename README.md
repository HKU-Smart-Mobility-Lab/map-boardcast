# Getting Started with this Project

```npm start```

### data formate
```js
const passengerAppearAction = {
  passengerid: 1,
  passengerCoordinates: [114.1694, 22.3193],
  range: 300,
};

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

```

