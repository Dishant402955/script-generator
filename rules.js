const DEFAULT = { x: 0.5, y: 0.5, scale: 1 };

function clamp(v, min = 0.05, max = 0.95) {
  return Math.max(min, Math.min(max, v));
}

// pick container from chain
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

function getCenter(box, viewport) {
  if (!box) return null;

  return {
    x: clamp((box.x + box.w / 2) / viewport.width),
    y: clamp((box.y + box.h / 2) / viewport.height)
  };
}

function getScale(seg, box, viewport) {
  const fast = seg.avgV > 0.15;
  const stable = seg.avgV < 0.05;

  if (seg.hasClick) return 1.6;
  if (seg.hasKey) return 1.5;
  if (fast) return 1;

  if (stable) {
    if (!box) return 1.25;

    const ratio = (box.w * box.h) / (viewport.width * viewport.height);
    let scale = 1 / Math.sqrt(ratio);
    return Math.min(Math.max(scale, 1.2), 1.8);
  }

  return 1.1;
}

function smooth(prev, next, f = 0.3) {
  return {
    x: prev.x * (1 - f) + next.x * f,
    y: prev.y * (1 - f) + next.y * f,
    scale: prev.scale * (1 - f) + next.scale * f
  };
}

module.exports = function (segments, viewport) {
  let prev = { ...DEFAULT };

  return segments.map(seg => {

    const chain =
      seg.events?.[0]?.elementChain ||
      seg.dominantChain ||
      seg.samples?.[0]?.elementChain;

    const box = pickContainer(chain, viewport);
    const center = getCenter(box, viewport);

    let zoom = {
      x: center?.x ?? clamp(seg.cursorCenter.x),
      y: center?.y ?? clamp(seg.cursorCenter.y),
      scale: getScale(seg, box, viewport)
    };

    zoom = smooth(prev, zoom, 0.3);
    prev = zoom;

    return {
      t: [seg.tStart / 1000, seg.tEnd / 1000],
      zoom
    };
  });
};