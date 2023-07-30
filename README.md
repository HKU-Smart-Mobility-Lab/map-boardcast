# Getting Started with this Project

At the root path of the project,

`npm install`

then,

`npm start`

Note that the default port is set as 3001, which can be altered in .env

### How to add your data

All the data are stored under src/data/ directory.
please name the driver and actions data as driver_route.js and actions_list.js.

Note that driver_route.js should follow the format below

```js
export const drivers = [
  {
    id: 160,
    route: []
      ...
  },{

  }
]
```

While actions_list.js should be

```js
export const actions = {
  5: [],
  10: []
  ...
}
```

### Action format

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

drivers:

```js
export const drivers = [
  {
    id: 0,
    route: [[114.1587, 22.3072], ...[114.1704, 22.3233]],
  },
  {
    id: 1,
    route: [[114.1611, 22.3188], ...[114.1549, 22.3148]],
  },
];
```
