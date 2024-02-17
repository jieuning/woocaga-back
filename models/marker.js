const mongoose = require("mongoose");
const { Schema } = mongoose;

const coordinateSchema = new Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
});

const markerSchema = new Schema({
  name: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  coordinates: [coordinateSchema],
});

const Markers = mongoose.model("Markers", markerSchema);
const Coordinate = mongoose.model("Coordinates", coordinateSchema);

module.exports = { Markers, Coordinate };
