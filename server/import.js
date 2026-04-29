const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });

const Property = require("./models/Property");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Connected to MongoDB");

  const dataPath = path.join(__dirname, "data", "properties.json");
  const json = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  await Property.deleteMany({});
  await Property.insertMany(json.properties);

  console.log("Data imported successfully!");
  process.exit();
});
