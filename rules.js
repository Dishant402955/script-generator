const DEFAULT = { x: 0.5, y: 0.5, scale: 1 };

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smooth(prev, next, factor = 0.7) {
  return {
    x: lerp(prev.x, next.x, factor),
    y: lerp(prev.y, next.y, factor),
    scale: lerp(prev.scale, next.scale, factor),
  };
}

function getTarget(seg) {
  if (seg.mutation && seg.mutation.element)
    return seg.mutation.element.boundingBox;

  if (seg.dominant && seg.dominant.boundingBox)
    return seg.dominant.boundingBox;

  return null;
}

module.exports = function applyRules(segments, viewport) {
  const VW = viewport?.width || 1920;
  const VH = viewport?.height || 1080;

  let prevZoom = { ...DEFAULT };

  const timeline = [];

  for (let seg of segments) {
    let zoom = { ...DEFAULT };

    const stable = seg.avgV < 0.05;
    const movingFast = seg.avgV > 0.15;

    const target = getTarget(seg);

    // ---------------- TARGET-BASED ZOOM ----------------
    if (
      target &&
      stable &&
      (seg.state === "focus" || seg.state === "change")
    ) {
      // center of target
      let cx = target.x + target.w / 2;
      let cy = target.y + target.h / 2;

      // normalize using REAL viewport
      cx = cx / VW;
      cy = cy / VH;

      // clamp to avoid edge breaking
      cx = clamp(cx, 0.05, 0.95);
      cy = clamp(cy, 0.05, 0.95);

      // dynamic zoom scale
      const sizeRatio = (target.w * target.h) / (VW * VH);

      let scale = 1 / Math.sqrt(sizeRatio);

      // clamp realistic zoom
      scale = clamp(scale, 1.2, 2.0);

      zoom = { x: cx, y: cy, scale };
    }

    // ---------------- MOVEMENT RESET ----------------
    else if (movingFast || seg.state === "moving") {
      zoom = { ...DEFAULT };
    }

    // ---------------- CURSOR FALLBACK ----------------
    else if (seg.cursorCenter) {
      zoom = {
        x: clamp(seg.cursorCenter.x, 0.05, 0.95),
        y: clamp(seg.cursorCenter.y, 0.05, 0.95),
        scale: 1.1,
      };
    }

    // ---------------- SOFT DECAY ----------------
    else {
      zoom = {
        x: lerp(prevZoom.x, DEFAULT.x, 0.5),
        y: lerp(prevZoom.y, DEFAULT.y, 0.5),
        scale: lerp(prevZoom.scale, DEFAULT.scale, 0.5),
      };
    }

    // ---------------- FINAL SMOOTHING ----------------
    zoom = smooth(prevZoom, zoom, 0.65);

    // ---------------- SAFETY ----------------
    if (
      !zoom ||
      isNaN(zoom.x) ||
      isNaN(zoom.y) ||
      isNaN(zoom.scale)
    ) {
      zoom = { ...DEFAULT };
    }

    prevZoom = zoom;

    timeline.push({
      t: [seg.tStart / 1000, seg.tEnd / 1000],
      zoom,
    });
  }

  return timeline;
};