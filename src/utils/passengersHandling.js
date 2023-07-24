import { importImage } from "../images/images";

const man = importImage("man");

export const createPulsingDot = (size, map) => {
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

export const updateDriverStatus = (map, driverid, newStatus) => {};
