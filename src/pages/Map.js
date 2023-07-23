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
import { mapActions } from "../data/actions";
import { actionsHandling } from "../utils/actionsHandling";

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
  const routes = [];
  const points = [];
  const arcs = [];
  const pickUpRoutes = [];
  let totalSteps =
    (drivers[0].route.length - 1) * mapConfig.carMovingStepsPerTimeInterval;

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

  const addCars = () => {
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
  };

  useEffect(() => {
    map.current.on("load", () => {
      map.current.addImage("carYellow", carYellow, { pixelRatio: 2 });
      map.current.addImage("carGreen", carGreen, { pixelRatio: 2 });
      map.current.addImage("carRed", carRed, { pixelRatio: 2 });
      addCars();
      console.log("Cars added");
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
        }

        const currentStep = Math.floor(
          counter / mapConfig.carMovingStepsPerTimeInterval
        );
        if (counter % mapConfig.carMovingStepsPerTimeInterval === 0) {
          console.log(currentStep);
          if (mapActions[currentStep]) {
            console.log(mapActions[currentStep]);
            for (const action of mapActions[currentStep]) {
              actionsHandling(map.current, action.actionType, action.data);
            }
          }
        }

        if (counter < totalSteps - 1) {
          requestAnimationFrame(animate);
        }
        counter = counter + 1;
      }
      animate(counter);
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
