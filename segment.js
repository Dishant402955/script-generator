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
    } else {
      if (cur.tEnd - cur.tStart >= 500) segs.push(cur);
      cur = { ...s };
    }
  });

  if (cur && cur.tEnd - cur.tStart >= 500) {
    segs.push(cur);
  }

  return segs;
};