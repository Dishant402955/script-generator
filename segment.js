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

      // ✅ accumulate avg for better stability
      cur.avgX = (cur.avgX + s.avgX) / 2;
      cur.avgY = (cur.avgY + s.avgY) / 2;
      cur.avgV = (cur.avgV + s.avgV) / 2;

    } else {

      // ✅ enforce stronger minimum duration
      if (cur.tEnd - cur.tStart >= 600) {
        segs.push(cur);
      }

      cur = { ...s };
    }
  });

  if (cur && cur.tEnd - cur.tStart >= 600) {
    segs.push(cur);
  }

  return segs;
};