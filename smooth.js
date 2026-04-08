module.exports = function (timeline) {
  const out = [];

  let prev = null;

  timeline.forEach(t => {
    if (!prev) {
      prev = t;
      return;
    }

    const sameZoom =
      JSON.stringify(prev.zoom) === JSON.stringify(t.zoom);

    if (sameZoom) {
      prev.t[1] = t.t[1];
    } else {
      out.push(prev);
      prev = t;
    }
  });

  if (prev) out.push(prev);

  return out;
};