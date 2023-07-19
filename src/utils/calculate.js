import { mapConfig } from "../config";
import * as turf from "@turf/turf";
/**
 *
 * @param {*} multiLineString
 * keep the number of segments the same between each pair of
 * consecutive points in the MultiLineString
 */

export function segmentMultiLineString(multiLineString) {
  const arc = [];
  var steps = mapConfig.carMovingStepsPerTimeInterval; // Number of segments between each pair of points
  for (var i = 0; i < multiLineString.length - 1; i++) {
    var start = multiLineString[i];
    var end = multiLineString[i + 1];
    var line = turf.lineString([start, end]);
    var lineDistance = turf.length(line, { units: "kilometers" });
    for (var j = 0; j < steps; j++) {
      var segment = turf.along(line, (j * lineDistance) / steps, {
        units: "kilometers",
      });
      arc.push(segment.geometry.coordinates);
    }
  }
  arc.push(multiLineString[multiLineString.length - 1]);
  return { arc, totalSteps: arc.length - 1 };
}

export function showCurrentLayers(map) {
  var layers = map.getStyle().layers;
  for (var i = 0; i < layers.length; i++) {
    console.log(layers[i].id);
  }
}
