module.exports = function (data) {
  const size = 100;

  const samples = data.samples || [];
  const events = data.events || [];

  const maxTime = Math.max(
    ...samples.map(s => s.time || 0),
    ...events.map(e => e.time || 0),
    0
  );

  const buckets = [];

  for (let t = 0; t <= maxTime; t += size) {
    buckets.push({
      tStart: t,
      tEnd: t + size,
      samples: [],
      events: []
    });
  }

  function fill(arr, key) {
    arr.forEach(x => {
      if (x.time == null) return;
      const i = Math.floor(x.time / size);
      if (buckets[i]) buckets[i][key].push(x);
    });
  }

  fill(samples, "samples");
  fill(events, "events");

  return buckets;
};