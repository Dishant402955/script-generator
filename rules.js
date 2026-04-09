const DEFAULT = { x: 0.5, y: 0.5, scale: 1 };

function clamp(v, min = 0.05, max = 0.95) {
  return Math.max(min, Math.min(max, v));
}

// ---------------- PICK CONTAINER ----------------
function pickContainer(chain, viewport) {
  if (!chain || !chain.length) return null;

  const screen = viewport.width * viewport.height;

  for (let el of chain) {
    const box = el.boundingBox;
    if (!box) continue;

    const ratio = (box.w * box.h) / screen;

    if (ratio > 0.05 && ratio < 0.6) return box;
  }

  return chain[0]?.boundingBox || null;
}

// ---------------- CENTER ----------------
function getCenter(box, viewport) {
  if (!box) return null;

  return {
    x: (box.x + box.w / 2) / viewport.width,
    y: (box.y + box.h / 2) / viewport.height
  };
}

// ---------------- VIEWPORT-SAFE CLAMP ----------------
// 🔥 THIS is the main fix for sidebar / edges
function clampCenterForScale(center, scale) {
  if (!center) return center;

  const half = 1 / scale / 2;

  return {
    x: Math.max(half, Math.min(1 - half, center.x)),
    y: Math.max(half, Math.min(1 - half, center.y))
  };
}

// ---------------- FIX SIDEBAR OFFSET ----------------
function adjustForLayoutBias(center, box, viewport) {
  if (!box) return center;

  const leftBias = box.x < viewport.width * 0.25;
  const rightBias = box.x + box.w > viewport.width * 0.75;

  let x = center.x;

  if (leftBias) x += 0.05;
  if (rightBias) x -= 0.05;

  return {
    x: clamp(x),
    y: clamp(center.y)
  };
}

// ---------------- SCALE ----------------
function getScale(seg, box, viewport) {
  const fast = seg.avgV > 0.15;
  const stable = seg.avgV < 0.05;

  if (seg.hasClick) return 1.6;
  if (seg.hasKey) return 1.5;
  if (fast) return 1;

  if (stable) {
    if (!box) return 1.2;

    const ratio = (box.w * box.h) / (viewport.width * viewport.height);
    let scale = 1 / Math.sqrt(ratio);

    const aspect = box.w / box.h;
    if (aspect < 0.6) {
      scale = Math.min(scale, 1.3);
    }

    return Math.min(Math.max(scale, 1.2), 1.8);
  }

  return 1.1;
}

// ---------------- BLEND (CURSOR DOM) ----------------
// 🔥 more cursor-dominant → reduces drift
function blend(cursor, dom) {
  if (!dom) return cursor;

  return {
    x: cursor.x * 0.75 + dom.x * 0.25,
    y: cursor.y * 0.75 + dom.y * 0.25
  };
}

// ---------------- STABILITY CHECK ----------------
function isSimilar(a, b) {
  return (
    Math.abs(a.x - b.x) < 0.025 &&
    Math.abs(a.y - b.y) < 0.025 &&
    Math.abs(a.scale - b.scale) < 0.08
  );
}

// ---------------- SMOOTH ----------------
function smooth(prev, next, f = 0.3) {
  return {
    x: prev.x * (1 - f) + next.x * f,
    y: prev.y * (1 - f) + next.y * f,
    scale: prev.scale * (1 - f) + next.scale * f
  };
}

// ---------------- MAIN ----------------
module.exports = function (segments, viewport) {
  let prev = { ...DEFAULT };
  const output = [];

  for (let seg of segments) {

    // ignore micro segments
    if (seg.tEnd - seg.tStart < 400) continue;

    const chain =
      seg.events?.[0]?.elementChain ||
      seg.dominantChain ||
      seg.samples?.[0]?.elementChain;

    const box = pickContainer(chain, viewport);

    const domCenter = getCenter(box, viewport);
    const cursor = seg.cursorCenter || DEFAULT;

    // 🔥 compute center
    let center = blend(cursor, domCenter);
    center = adjustForLayoutBias(center, box, viewport);

    let scale = getScale(seg, box, viewport);

    // 🔥 MAIN FIX: constrain center based on zoom
    center = clampCenterForScale(center, scale);

    let zoom = {
      x: clamp(center.x),
      y: clamp(center.y),
      scale
    };

    // stabilize
    if (isSimilar(prev, zoom)) {
      zoom = prev;
    } else {
      zoom = smooth(prev, zoom, 0.3);
    }

    prev = zoom;

    output.push({
      t: [seg.tStart / 1000, seg.tEnd / 1000],
      zoom
    });
  }

  return output;
};