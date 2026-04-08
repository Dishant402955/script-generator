module.exports = function (buckets) {
  return buckets.map(b => {
    const s = b.samples;

    let avgX = 0, avgY = 0, avgV = 0;

    if (s.length) {
      avgX = s.reduce((a, x) => a + x.x, 0) / s.length;
      avgY = s.reduce((a, x) => a + x.y, 0) / s.length;
      avgV = s.reduce((a, x) => a + x.velocity, 0) / s.length;
    }

    const dominant = s[0]?.element || null;

    let mutation = null;
    if (b.mutations.length) {
      mutation = b.mutations.reduce((a, c) => {
        const A = a.element.boundingBox;
        const C = c.element.boundingBox;
        return (C.w * C.h > A.w * A.h) ? c : a;
      });
    }

    return {
      tStart: b.tStart,
      tEnd: b.tEnd,
      avgX,
      avgY,
      avgV,
      hasClick: b.events.some(e => e.type === "click"),
      hasKey: b.events.some(e => e.type === "keydown"),
      mutation,
      dominant
    };
  });
};