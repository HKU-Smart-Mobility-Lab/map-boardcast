# HKU Smart Mobility Lab: Driver-Order Matching Visualization

This repository contains a versatile and interactive visualization tool developed by the Smart Mobility Lab at The University of Hong Kong (HKU), under the direction of Dr. KE Jingtao. The primary aim of this project is to provide a customizable visualization of a driver-order matching broadcasting algorithm. It is designed to emulate and illustrate scenarios akin to ride-hailing services like Uber.

## Features

The visualization tool showcases a detailed simulation of around 200 drivers and approximately 1000 order requests within the Hong Kong Island area. Users are empowered to configure their own data sets, allowing for extensive adaptability and customization based on individual requirements.

## Application

This project has significant implications for the design of smart mobility and ride-hailing services. By visualizing and analyzing the dynamics of driver-order matching algorithms, we can identify potential inefficiencies, devise strategies for improvement, and ultimately enhance the user experience for both drivers and passengers.

We welcome contributions and feedback to further improve this tool and broaden its potential applications.

## Citation
If you use any part of this repo, you are highly encouraged to cite our paper:

Chen, T., Shen, Z., Feng, S., Yang, L., & Ke, J. (2023). Dynamic Adjustment of Matching Radii under the Broadcasting Mode: A Novel Multitask Learning Strategy and Temporal Modeling Approach. arXiv preprint arXiv:2312.05576.

## Getting Started with this Project

### Install all the dependencies

At the root path of the project,

`npm install`
,

`npm start`

- Note that the default port is set as 3001, which can be altered in .env
- Should there be any problems, delete `package-lock.json`, and re-install


### Replace Mapbox token

You should include your Mapbox token in `.env` file

To obtain a token, you can find more information in the [Mapbox official documentation](https://docs.mapbox.com/help/getting-started/access-tokens/). The service is free for use on a personal scale.


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

`carMovingStepsPerTimeInterval`: This parameter defines the number of interpolation between two steps.

`timeInterval`: This parameter defines the duration of each time interval in the simulation, measured in seconds. The default value is 5,

`startingLongitude`: This parameter sets the starting longitude for the map visualization. The default value is 114.1686, which corresponds to a location in Hong Kong Island. You can change this to the longitude of any location you want to focus your simulation on.

`startingLatitude`: Similar to startingLongitude, this parameter sets the starting latitude for the map visualization. The default value is 22.28, which also corresponds to a location in Hong Kong Island. Modify this to change the latitude of your simulation's focus area.

`zoomingLevel`: This parameter controls the initial zoom level of the map in the visualization. The default value is 15, which represents a fairly close view (street level) of the map. Increase this value to zoom in further, or decrease it to zoom out and see a larger area.
