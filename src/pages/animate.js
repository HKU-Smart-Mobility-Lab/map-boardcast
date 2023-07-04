mapboxgl.accessToken =
  "pk.eyJ1IjoiY3JhamFyIiwiYSI6ImNraDF0MnA1dzBlOXoyeW9raDkwc21xbDAifQ.7OZ1Fz-TTzZFNH5mwDCXqg";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v9",
  center: [-83.189522, 42.330406],
  zoom: 14,
});

var steps = 5000;

// San Francisco
var origin = [-83.189522, 42.330406];

// Washington DC
var destination = [-83.202728, 42.328476];

// A simple line from origin to destination.
var route = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [-83.1900001, 42.3304188],
          [-83.1899679, 42.3297966],
          [-83.1899679, 42.3297966],
          [-83.1899679, 42.3295069],
          [-83.1899679, 42.3295069],
          [-83.1917381, 42.3294747],
          [-83.1932294, 42.3293889],
          [-83.1953216, 42.3293352],
          [-83.197875, 42.3293138],
          [-83.198905, 42.3293352],
          [-83.1997848, 42.3293889],
          [-83.2011151, 42.3293889],
          [-83.2018876, 42.3293567],
          [-83.2041407, 42.3293352],
          [-83.2067585, 42.3292816],
          [-83.2067585, 42.3292816],
          [-83.2068229, 42.3291636],
          [-83.2068336, 42.3290992],
          [-83.2068121, 42.3290133],
          [-83.2026279, 42.3290455],
          [-83.2026279, 42.3290455],
          [-83.2018554, 42.3285091],
          [-83.2018554, 42.3285091],
          [-83.20207, 42.3283589],
          [-83.20207, 42.3283589],
          [-83.2024929, 42.3286578],
          [-83.2024929, 42.3286578],
        ],
      },
    },
  ],
};

// A single point that animates along the route.
// Coordinates are initially set to origin.
var point = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Point",
        coordinates: origin,
      },
    },
  ],
};

// Calculate the distance in kilometers between route start/end point.
var lineDistance = turf.lineDistance(route.features[0], "kilometers");

var arc = [];

// Number of steps to use in the arc and animation, more steps means
// a smoother arc and animation, but too many steps will result in a
// low frame rate
var steps = 1000;

// Draw an arc between the `origin` & `destination` of the two points
for (var i = 0; i < lineDistance; i += lineDistance / steps) {
  var segment = turf.along(route.features[0], i, "kilometers");
  arc.push(segment.geometry.coordinates);
}

// Update the route with calculated arc coordinates
route.features[0].geometry.coordinates = arc;

// Used to increment the value of the point measurement against the route.
var counter = 0;

map.on("load", function () {
  // Add a source and layer displaying a point which will be animated in a circle.
  map.addSource("route", {
    type: "geojson",
    data: route,
  });

  map.addSource("point", {
    type: "geojson",
    data: point,
  });

  map.addLayer({
    id: "route",
    source: "route",
    type: "line",
    paint: {
      "line-width": 2,
      "line-color": "#007cbf",
    },
  });

  map.addLayer({
    id: "point",
    source: "point",
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
    // Update point geometry to a new position based on counter denoting
    // the index to access the arc.
    point.features[0].geometry.coordinates =
      route.features[0].geometry.coordinates[counter];

    // Calculate the bearing to ensure the icon is rotated to match the route arc
    // The bearing is calculate between the current point and the next point, except
    // at the end of the arc use the previous point and the current point
    point.features[0].properties.bearing = turf.bearing(
      turf.point(
        route.features[0].geometry.coordinates[
          counter >= steps ? counter - 1 : counter
        ]
      ),
      turf.point(
        route.features[0].geometry.coordinates[
          counter >= steps ? counter : counter + 1
        ]
      )
    );

    // Update the source with this new data.
    map.getSource("point").setData(point);

    // Request the next frame of animation so long the end has not been reached.
    if (counter < steps) {
      requestAnimationFrame(animate);
    }

    counter = counter + 1;
  }

  document.getElementById("replay").addEventListener("click", function () {
    // Set the coordinates of the original point back to origin
    point.features[0].geometry.coordinates = origin;

    // Update the source layer
    map.getSource("point").setData(point);

    // Reset the counter
    counter = 0;

    // Restart the animation.
    animate(counter);
  });

  // Start the animation.
  animate(counter);
});
