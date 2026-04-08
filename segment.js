module.exports = function (states) {
  const segs = [];
  let cur = null;

  states.forEach(s => {
    if (!cur) {
      cur = { ...s };
      return;
    }

    if (s.state === cur.state) {
      cur.tEnd = s.tEnd;

      cur.avgX = (cur.avgX + s.avgX) / 2;
      cur.avgY = (cur.avgY + s.avgY) / 2;
      cur.avgV = (cur.avgV + s.avgV) / 2;

      // merge samples/events
      cur.samples = [...(cur.samples || []), ...(s.samples || [])];
      cur.events = [...(cur.events || []), ...(s.events || [])];

    } else {
      if (cur.tEnd - cur.tStart >= 250) {
        segs.push(cur);
      }
      cur = { ...s };
    }
  });

  if (cur && cur.tEnd - cur.tStart >= 250) {
    segs.push(cur);
  }

  return segs;
};