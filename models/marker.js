const mongoose = require("mongoose");
const { Schema } = mongoose;

const coordinateSchema = new Schema({
  coordinates: {
    type: [
      {
        latitude: Number,
        longitude: Number,
      },
    ],
  },
});

const markerSchema = new Schema({
  name: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  category: {
    type: String,
    default: null,
  },
  coordinates: [
    {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
  ],
});

const Markers = mongoose.model("Markers", markerSchema);
const Coordinate = mongoose.model("Coordinates", coordinateSchema);

module.exports = { Markers, Coordinate };
