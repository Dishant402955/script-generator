const DEFAULT = { x: 0.5, y: 0.5, scale: 1 };

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function smooth(prev, next, f = 0.65) {
  return {
    x: prev.x * (1 - f) + next.x * f,
    y: prev.y * (1 - f) + next.y * f,
    scale: prev.scale * (1 - f) + next.scale * f,
  };
}

function getTarget(seg) {
  if (seg.mutation?.element) return seg.mutation.element.boundingBox;
  if (seg.dominant?.boundingBox) return seg.dominant.boundingBox;
  return null;
}

module.exports = function (segments, viewport) {
  const VW = viewport.width;
  const VH = viewport.height;

  let prev = { ...DEFAULT };

  return segments.map(seg => {

    let zoom = { ...DEFAULT };

    const stable = seg.avgV < 0.05;
    const moving = seg.avgV > 0.15;

    // ---------------- CENTER SOURCE ----------------

    let cx = null;
    let cy = null;

    // 1️⃣ interaction → best signal
    if (seg.hasClick && seg.events?.length) {
      const e = seg.events[0];
      cx = e.x;
      cy = e.y;
    }

    // 2️⃣ focus → avg cursor
    else if (seg.cursorCenter && stable) {
      cx = seg.cursorCenter.x;
      cy = seg.cursorCenter.y;
    }

    // ---------------- SCALE ----------------

    let scale = 1;

    const target = getTarget(seg);

    if (target && stable) {
      const sizeRatio = (target.w * target.h) / (VW * VH);
      scale = 1 / Math.sqrt(sizeRatio);
      scale = clamp(scale, 1.2, 2.0);
    }

    // ---------------- BUILD ZOOM ----------------

    if (cx !== null && cy !== null && !moving) {
      zoom = {
        x: clamp(cx, 0.05, 0.95),
        y: clamp(cy, 0.05, 0.95),
        scale
      };
    }

    // moving → reset
    else if (moving) {
      zoom = { ...DEFAULT };
    }

    // fallback
    else {
      zoom = {
        x: (prev.x + DEFAULT.x) / 2,
        y: (prev.y + DEFAULT.y) / 2,
        scale: (prev.scale + DEFAULT.scale) / 2,
      };
    }

    // smoothing
    zoom = smooth(prev, zoom, 0.65);

    prev = zoom;

    return {
      t: [seg.tStart / 1000, seg.tEnd / 1000],
      zoom
    };
  });
};