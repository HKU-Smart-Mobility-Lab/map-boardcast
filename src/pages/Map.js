"use client";

import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "mapbox-gl/dist/mapbox-gl.css";
import passengers from "../data/passengers";
import * as turf from "@turf/turf";
import { drivers } from "../data/drivers";
import { importImage } from "../images/images";
import { appConfig, mapConfig } from "../config";
import { segmentMultiLineString } from "../utils/calculate";
import { createPulsingDot, pickUpPassenger } from "../utils/layers";
import { passengerNaming } from "../utils/naming";

mapboxgl.accessToken = appConfig.mapboxToken;

const carYellow = importImage("car-yellow");
const carRed = importImage("car-red");
const carGreen = importImage("car-green");

export default function Map() {
  const mapContainer = useRef(null);
  const tooltipRef = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(114.1694);
  const [lat, setLat] = useState(22.3193);
  const [zoom, setZoom] = useState(15);

  // Map set up
  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [lng, lat],
      zoom: zoom,
    });
    // map.current.scrollZoom.disable();
  });

  useEffect(() => {
    if (!map.current) return;
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  const addedPassengers = () => {
    for (const passenger of passengers) {
      const { imageName, sourceName, layerName } = passengerNaming(
        passenger.id
      );
      map.current.addImage(
        imageName,
        createPulsingDot(passenger.range, map.current),
        { pixelRatio: 2 }
      );

      map.current.addSource(sourceName, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [passenger.lng, passenger.lat], // icon position [lng, lat]
              },
            },
          ],
        },
      });

      map.current.addLayer({
        id: layerName,
        type: "symbol",
        source: sourceName,
        layout: {
          "icon-image": imageName,
        },
      });

      map.current.on("mouseenter", layerName, function (e) {
        const tooltip = tooltipRef.current;

        if (tooltip) {
          tooltip.classList.remove("hidden");
          tooltip.style.left = `${e.originalEvent.pageX}px`;
          tooltip.style.top = `${e.originalEvent.pageY}px`;
          tooltip.innerHTML = `ID: ${passenger.id}<br>Range: ${passenger.range}<br>Name: ${passenger.name}`;
        }
      });

      // Hide the tooltip when the mouse leaves the man image
      map.current.on("mouseleave", layerName, function () {
        const tooltip = tooltipRef.current;
        if (tooltip) {
          tooltip.classList.add("hidden");
        }
      });
    }
  };

  const addCars = () => {
    const routes = [];
    const points = [];
    const arcs = [];
    const pickUpRoutes = [];
    let totalSteps =
      (drivers[0].route.length - 1) * mapConfig.carMovingStepsPerTimeInterval;

    for (let i = 0; i < drivers.length; i++) {
      const driver = drivers[i];
      const originalCoordinates = driver.route[0];
      const carSourceName = `car-source-${driver.id}`;
      const carLayerName = `car-layer-${driver.id}`;
      const carPickUpRouteLayerName = `pick-up-route-layer-${driver.id}`;
      const carPickUpRouteSourceName = `pick-up-route-${driver.id}`;
      routes.push({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: driver.route,
            },
          },
        ],
      });

      points.push({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: originalCoordinates,
            },
          },
        ],
      });

      let { arc } = segmentMultiLineString(
        routes[i].features[0].geometry.coordinates
      );

      arcs.push(Array.from(arc));

      routes[i].features[0].geometry.coordinates = Array.from(arc);
      pickUpRoutes.push({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: Array.from(arc).reverse(),
            },
          },
        ],
      });

      map.current.addSource(carPickUpRouteSourceName, {
        type: "geojson",
        data: pickUpRoutes[i],
      });

      map.current.addLayer({
        id: carPickUpRouteLayerName,
        source: carPickUpRouteSourceName,
        type: "line",
        paint: {
          "line-width": 2,
          "line-color": "#007cbf",
        },
      });

      map.current.addSource(carSourceName, {
        type: "geojson",
        data: points[i],
      });

      map.current.addLayer({
        id: carLayerName,
        source: carSourceName,
        type: "symbol",
        layout: {
          "icon-image": "carYellow",
          "icon-rotate": ["get", "bearing"],
          "icon-rotation-alignment": "map",
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });
    }
    var counter = 0;

    function animate() {
      for (let i = 0; i < drivers.length; i++) {
        points[i].features[0].geometry.coordinates =
          routes[i].features[0].geometry.coordinates[counter];

        points[i].features[0].properties.bearing = turf.bearing(
          turf.point(
            routes[i].features[0].geometry.coordinates[
              counter >= totalSteps ? counter - 1 : counter
            ]
          ),
          turf.point(
            routes[i].features[0].geometry.coordinates[
              counter >= totalSteps ? counter : counter + 1
            ]
          )
        );

        map.current.getSource(`car-source-${i}`).setData(points[i]);
        pickUpRoutes[i].features[0].geometry.coordinates.pop();
        map.current.getSource(`pick-up-route-${i}`).setData(pickUpRoutes[i]);
        console.log(counter, 17 * mapConfig.carMovingStepsPerTimeInterval);
        if (
          i === 0 &&
          counter === 17 * mapConfig.carMovingStepsPerTimeInterval
        ) {
          console.log(map.current, drivers[i].actions["17"]?.passenger, i);
          pickUpPassenger(map.current, drivers[i].actions["17"]?.passenger, i);
        }
      }
      if (counter < totalSteps - 1) {
        requestAnimationFrame(animate);
      }
      counter = counter + 1;
    }
    animate(counter);
  };

  useEffect(() => {
    map.current.on("load", () => {
      map.current.addImage("carYellow", carYellow, { pixelRatio: 2 });
      map.current.addImage("carGreen", carGreen, { pixelRatio: 2 });
      map.current.addImage("carRed", carRed, { pixelRatio: 2 });
      addedPassengers();
      addCars();
    });
  }, []);

  return (
    <div className="w-screen h-screen">
      <div className="fixed top-0 left-0 right-0 bg-slate-600 z-10">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom} | Hong Kong
      </div>
      <div
        ref={tooltipRef}
        className="hidden absolute bg-white p-10 rounded text-sm z-20 text-black"
      ></div>
      <div className="w-screen h-screen" ref={mapContainer} />
    </div>
  );
}
