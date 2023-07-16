"use client";

import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import passengers from "../data/passengers";
import * as turf from "@turf/turf";
import { drivers } from "../data/drivers";
import { importImage } from "../images/images";
import { appConfig } from "../config";
import { segmentMultiLineString } from "../utils/calculate";

mapboxgl.accessToken = appConfig.mapboxToken;

const man = importImage("man");
const car = importImage("car");
const frameRate = 60;
const frameInterval = 1000 / frameRate;

const createPulsingDot = (size, map) => {
  return {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    onAdd: function () {
      const canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext("2d");
    },

    render: function () {
      const duration = 1000;
      const t = (performance.now() % duration) / duration;

      const radius = (size / 2) * 0.3;
      const outerRadius = (size / 2) * 0.7 * t + radius;
      const context = this.context;

      context.clearRect(0, 0, this.width, this.height);

      if (man.complete) {
        const imgWidth = 50;
        const imgHeight = 50;
        const imgPosX = (this.width - imgWidth) / 2;
        const imgPosY = (this.height - imgHeight) / 2;
        context.drawImage(man, imgPosX, imgPosY, imgWidth, imgHeight);
      }

      context.beginPath();
      context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 200, 200, ${1 - t})`;
      context.fill();

      // Update this image's data with data from the canvas.
      this.data = context.getImageData(0, 0, this.width, this.height).data;
      map.triggerRepaint();

      // Return `true` to let the map know that the image was updated.
      return true;
    },
  };
};

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
    map.current.scrollZoom.disable();
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
    const route = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: drivers[0].route,
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
            coordinates: [114.1704, 22.3233],
          },
        },
      ],
    };

    var { arc, totalSteps } = segmentMultiLineString(
      route.features[0].geometry.coordinates
    );

    route.features[0].geometry.coordinates = arc;
    const route2 = route;
    var counter = 0;

    map.current.addSource("route2", {
      type: "geojson",
      data: route2,
    });

    map.current.addLayer({
      id: "route2",
      source: "route2",
      type: "line",
      paint: {
        "line-width": 2,
        "line-color": "#007cbf",
      },
    });

    map.current.addSource("car", {
      type: "geojson",
      data: point,
    });

    map.current.addImage("car-15", car, { pixelRatio: 2 });

    map.current.addLayer({
      id: "carRoute",
      source: "car",
      type: "symbol",
      layout: {
        "icon-image": "car-15",
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

      map.current.getSource("car").setData(point);
      route2.features[0].geometry.coordinates.shift();
      map.current.getSource("route2").setData(route2);
      if (counter < totalSteps) {
        requestAnimationFrame(animate);
      }
      counter = counter + 1;
    }
    animate(counter);
  };

  useEffect(() => {
    map.current.on("load", () => {
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
