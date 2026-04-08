const fs = require("fs");

const bucketize = require("./bucket");
const extractFeatures = require("./features");
const classifyStates = require("./state");
const createSegments = require("./segment");
const applyRules = require("./rules");
const smooth = require("./smooth");

const data = JSON.parse(fs.readFileSync("./data/recording.json", "utf-8"));

// 🔥 FIX: correct path
const viewport = data.meta?.viewport || { width: 1920, height: 1080 };

const buckets = bucketize(data);
const features = extractFeatures(buckets);
const states = classifyStates(features);
const segments = createSegments(states);
const timeline = applyRules(segments, viewport);
const smoothTimeline = smooth(timeline);

fs.writeFileSync(
  "./output/script.json",
  JSON.stringify(smoothTimeline, null, 2)
);

console.log("Done.");