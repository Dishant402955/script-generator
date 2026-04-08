function center(box) {
  return {
    x: box.x + box.w / 2,
    y: box.y + box.h / 2
  };
}

module.exports = function (segments) {
  return segments.map(seg => {
    const out = {
      t: [seg.tStart / 1000, seg.tEnd / 1000]
    };

    let target = null;

    if (seg.mutation) target = seg.mutation.element.boundingBox;
    else if (seg.dominant) target = seg.dominant.boundingBox;

    if (seg.state === "focus" && target) {
      const c = center(target);
      out.zoom = {
        x:  0.5,
        y: 0.5,
        scale: 1.6
      };
    }

    if (seg.state === "interaction" && target) {
      out.highlight = target;
    }

    if (seg.state === "change" && target) {
      const c = center(target);
      out.zoom = {
        x: c.x / 1920,
        y: c.y / 1080,
        scale: 1.5
      };
    }

    if (seg.state === "moving") {
      out.zoom = { x: 0.5, y: 0.5, scale: 1 };
    }

    if (seg.state === "focus" && (seg.tEnd - seg.tStart) > 1500) {
      out.subtitle = "Explaining section";
    }

    return out;
  });
};