const fs = require("fs");

const bucketize = require("./bucket");
const extractFeatures = require("./features");
const classifyStates = require("./state");
const createSegments = require("./segment");
const applyRules = require("./rules");
const smooth = require("./smooth");
const output = require("./output");

const data = JSON.parse(fs.readFileSync("./data/recording.json", "utf-8"));

const buckets = bucketize(data);
const features = extractFeatures(buckets);
const states = classifyStates(features);
const segments = createSegments(states);
const timeline = applyRules(segments);
const smoothTimeline = smooth(timeline);

fs.writeFileSync(
  "./output/script.json",
  JSON.stringify(output(smoothTimeline), null, 2)
);

console.log("Done.");