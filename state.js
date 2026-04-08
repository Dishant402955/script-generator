module.exports = function (features) {
  return features.map(f => {
    let state = "idle";

    if (f.hasClick || f.hasKey) state = "interaction";
    else if (f.mutation) state = "change";
    else if (f.avgV < 0.05 && f.dominant) state = "focus";
    else if (f.avgV >= 0.05) state = "moving";

    return { ...f, state };
  });
};