# HKU Smart Mobility Lab: Driver-Order Matching Visualization

This repository contains a versatile and interactive visualization tool developed by the Smart Mobility Lab at The University of Hong Kong (HKU), under the direction of Dr. KE Jingtao. The primary aim of this project is to provide a customizable visualization of a driver-order matching broadcasting algorithm. It is designed to emulate and illustrate scenarios akin to ride-hailing services like Uber.

## Features

The visualization tool showcases a detailed simulation of around 200 drivers and approximately 1000 order requests within the Hong Kong Island area. Users are empowered to configure their own data sets, allowing for extensive adaptability and customization based on individual requirements.

## Application

This project has significant implications for the design of smart mobility and ride-hailing services. By visualizing and analyzing the dynamics of driver-order matching algorithms, we can identify potential inefficiencies, devise strategies for improvement, and ultimately enhance the user experience for both drivers and passengers.

We welcome contributions and feedback to further improve this tool and broaden its potential applications.

## Getting Started with this Project

At the root path of the project,

`npm install`
,

`npm start`

- Note that the default port is set as 3001, which can be altered in .env
- Should there be any problems, delete `package-lock.json`, and re-install

### How to add your own data

All the data are stored under `src/data/`.
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
  driverid: 17, // not using driverid yet
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

### About the configuration params

To be done

## Acknowledgments

This project is an initiative of the Smart Mobility Lab at The University of Hong Kong (HKU), under the guidance and leadership of Dr. KE. The team is grateful for the support and resources provided by HKU.

_Please refer to the `README.md` and the documentation within the repository for further information on how to install, configure, and use this tool._
