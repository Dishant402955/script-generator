module.exports = function (data) {
  const size = 200;

  const maxTime = Math.max(
    ...data.samples.map(s => s.time),
    ...data.events.map(e => e.time),
    ...data.mutations.map(m => m.time),
    0
  );

  const buckets = [];

  for (let t = 0; t <= maxTime; t += size) {
    buckets.push({
      tStart: t,
      tEnd: t + size,
      samples: [],
      events: [],
      mutations: []
    });
  }

  function fill(arr, key) {
    arr.forEach(x => {
      const i = Math.floor(x.time / size);
      if (buckets[i]) buckets[i][key].push(x);
    });
  }

  fill(data.samples, "samples");
  fill(data.events, "events");
  fill(data.mutations, "mutations");

  return buckets;
};