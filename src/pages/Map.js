"use client";

import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import passengers from "../data/passengers";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWF0dGp3YW5nIiwiYSI6ImNsaXB5NDN1cTAzMnAza28xaG54ZWRrMzgifQ.cUju1vqjuW7XmAuO2iEZmg";

let man;

function loadImage() {
  man = new Image();
  man.src = "/static/man.png";
  man.onload = () => {
    console.log("loaded");
  };
}

loadImage();
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

  useEffect(() => {
    // Map set up
    if (map.current) return;
    loadImage();
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
            coordinates: [
              [114.1704, 22.3233],
              [114.1694, 22.3193],
              [114.1685, 22.3188],
              [114.1683, 22.3173],
              [114.1672, 22.3165],
              [114.1665, 22.3159],
              [114.1657, 22.3152],
              [114.165, 22.3144],
              [114.1643, 22.3137],
              [114.1637, 22.3129],
              [114.163, 22.3122],
              [114.1624, 22.3115],
              [114.1617, 22.3108],
              [114.1611, 22.3101],
              [114.1605, 22.3093],
              [114.1599, 22.3086],
              [114.1593, 22.3079],
              [114.1587, 22.3072],
              [114.1581, 22.3065],
              [114.1575, 22.3058],
              [114.1569, 22.3051],
            ],
          },
        },
      ],
    };
    map.current.addSource("route", {
      type: "geojson",
      data: route,
    });
    map.current.addLayer({
      id: "route",
      source: "route",
      type: "line",
      paint: {
        "line-width": 2,
        "line-color": "#007cbf",
      },
    });
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
