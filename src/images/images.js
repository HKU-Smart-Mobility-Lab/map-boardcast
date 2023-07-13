export function importImage(name) {
  let img = new Image();
  img.src = `/static/${name}.png`;
  return img;
}
