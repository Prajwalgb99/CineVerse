import * as THREE from "three";
type Draw = (c: CanvasRenderingContext2D, s: number) => void;
export function canvasTex(size: number, draw: Draw, repeat: [number, number] = [1, 1], srgb = true) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  draw(cv.getContext("2d")!, size);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
export const noise = (base: string, amt: number): Draw => (c, s) => {
  c.fillStyle = base; c.fillRect(0, 0, s, s);
  const d = c.getImageData(0, 0, s, s);
  for (let i = 0; i < d.data.length; i += 4) {
    const n = (Math.random() - 0.5) * amt;
    d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n;
  }
  c.putImageData(d, 0, 0);
};
/** woven fabric bump */
export const fabricBump = (): Draw => (c, s) => {
  noise("#808080", 70)(c, s);
  c.strokeStyle = "#00000040"; c.lineWidth = 1;
  for (let i = 0; i < s; i += 4) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, s); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(s, i); c.stroke(); }
};
/** patterned cinema carpet */
export const carpet = (): Draw => (c, s) => {
  noise("#4a1420", 36)(c, s);
  c.strokeStyle = "#7d2c3a66"; c.lineWidth = 3;
  for (let x = 0; x < s; x += s / 4) for (let y = 0; y < s; y += s / 4) {
    const h = s / 8; c.beginPath(); c.moveTo(x + h, y); c.lineTo(x + 2 * h, y + h); c.lineTo(x + h, y + 2 * h); c.lineTo(x, y + h); c.closePath(); c.stroke();
  }
};
