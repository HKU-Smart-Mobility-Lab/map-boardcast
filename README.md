# Getting Started with this Project

At the root path of the project,

```npm install```
then,
```npm start```

### source data format
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
    route: [
      [114.1587, 22.3072],
      [114.1593, 22.3079],
      [114.1599, 22.3086],
      [114.1605, 22.3093],
      [114.1611, 22.3101],
      [114.1617, 22.3108],
      [114.1624, 22.3115],
      [114.163, 22.3122],
      [114.1637, 22.3129],
      [114.1643, 22.3137],
      [114.165, 22.3144],
      [114.1657, 22.3152],
      [114.1665, 22.3159],
      [114.1672, 22.3165],
      [114.1683, 22.3173],
      [114.1685, 22.3188],
      [114.1694, 22.3193],
      [114.1694, 22.3193],
      [114.1694, 22.3193],
      [114.1694, 22.3193],
      [114.1704, 22.3233],
    ],
  },
  {
    id: 1,
    route: [
      [114.1611, 22.3188],
      [114.1611, 22.3188],
      [114.1611, 22.3188],
      [114.1611, 22.3188],
      [114.1611, 22.3188],
      [114.1611, 22.3188],
      [114.1611, 22.3188],
      [114.1611, 22.3188],
      [114.1594, 22.3193],
      [114.1589, 22.3188],
      [114.1584, 22.3183],
      [114.1579, 22.3178],
      [114.1574, 22.3173],
      [114.1569, 22.3168],
      [114.1569, 22.3168],
      [114.1569, 22.3168],
      [114.1569, 22.3168],
      [114.1564, 22.3163],
      [114.1559, 22.3158],
      [114.1554, 22.3153],
      [114.1549, 22.3148],
    ],
  },
];

```
