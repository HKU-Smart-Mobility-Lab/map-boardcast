"use client";

import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import passengers from "../data/passengers";
import * as turf from "@turf/turf";
import { drivers } from "../data/drivers";
import { importImage } from "../images/images";
import { appConfig } from "../config";
import { segmentMultiLineString } from "../utils/calculate";
import { createPulsingDot } from "../utils/layers";

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
      const imageName = `pulsing-dot-${passenger.id}`;
      const sourceName = `dot-dot-${passenger.id}`;
      const layerName = `layer-${passenger.id}`;
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

      if (passenger.pickedUpTime > 0) {
        setTimeout(() => {
          map.current.removeLayer(layerName);
        }, passenger.pickedUpTime);
      }
    }
  };

  const addCars = () => {
    for (const driver of drivers) {
      const originalCoordinates = driver.route[0];
      const carSourceName = `car-source-${driver.id}`;
      const carLayerName = `car-layer-${driver.id}`;
      const carPickUpRouteLayerName = `pick-up-route-layer-${driver.id}`;
      const carPickUpRouteSourceName = `pick-up-route-${driver.id}`;
      const route = {
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
      };

      var point = {
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
      };

      var { arc, totalSteps } = segmentMultiLineString(
        route.features[0].geometry.coordinates
      );

      route.features[0].geometry.coordinates = arc;
      const pickUpRoute = {
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
      };
      var counter = 0;

      map.current.addSource(carPickUpRouteSourceName, {
        type: "geojson",
        data: pickUpRoute,
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
        data: point,
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

      function animate() {
        point.features[0].geometry.coordinates =
          route.features[0].geometry.coordinates[counter];

        point.features[0].properties.bearing = turf.bearing(
          turf.point(
            route.features[0].geometry.coordinates[
              counter >= totalSteps ? counter - 1 : counter
            ]
          ),
          turf.point(
            route.features[0].geometry.coordinates[
              counter >= totalSteps ? counter : counter + 1
            ]
          )
        );

        map.current.getSource(carSourceName).setData(point);
        pickUpRoute.features[0].geometry.coordinates.pop();
        map.current.getSource(carPickUpRouteSourceName).setData(pickUpRoute);
        if (counter < totalSteps) {
          requestAnimationFrame(animate);
        }
        counter = counter + 1;
      }
      animate(counter);
    }
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
