module.exports = function (buckets) {
  return buckets.map(b => {
    const s = b.samples;

    let avgX = 0, avgY = 0, avgV = 0;

    if (s.length) {
      avgX = s.reduce((a, x) => a + x.x, 0) / s.length;
      avgY = s.reduce((a, x) => a + x.y, 0) / s.length;
      avgV = s.reduce((a, x) => a + x.velocity, 0) / s.length;
    }

    // ✅ dominant chain (not element anymore)
    let dominantChain = null;

    if (s.length) {
      const map = {};

      s.forEach(x => {
        const key = JSON.stringify(x.elementChain);
        map[key] = (map[key] || 0) + 1;
      });

      const best = Object.entries(map).sort((a, b) => b[1] - a[1])[0];
      dominantChain = best ? JSON.parse(best[0]) : null;
    }

    return {
      tStart: b.tStart,
      tEnd: b.tEnd,
      avgX,
      avgY,
      avgV,
      hasClick: b.events.some(e => e.type === "click"),
      hasKey: b.events.some(e => e.type === "keydown"),
      cursorCenter: { x: avgX, y: avgY },
      dominantChain,
      samples: b.samples,
      events: b.events
    };
  });
};