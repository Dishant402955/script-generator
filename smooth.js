function dist(a, b) {
  return (
    Math.abs(a.x - b.x) +
    Math.abs(a.y - b.y)
  );
}

function scaleDiff(a, b) {
  return Math.abs(a.scale - b.scale);
}

module.exports = function (timeline) {
  if (!timeline.length) return [];

  const result = [];

  let anchor = timeline[0]; // 🔥 current stable zoom

  for (let i = 0; i < timeline.length; i++) {
    const curr = timeline[i];

    const move = dist(anchor.zoom, curr.zoom);
    const scaleChange = scaleDiff(anchor.zoom, curr.zoom);

    const BIG_MOVE = 0.12;      // position threshold
    const BIG_SCALE = 0.25;     // scale threshold

    const shouldSwitch =
      move > BIG_MOVE || scaleChange > BIG_SCALE;

    if (shouldSwitch) {
      // 🔥 commit previous anchor
      result.push(anchor);

      // 🔥 switch anchor
      anchor = { ...curr };
    } else {
      // 🔥 extend current anchor
      anchor.t[1] = curr.t[1];
    }
  }

  result.push(anchor);

  return result;
};