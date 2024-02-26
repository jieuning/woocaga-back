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
    default: null,
  },
  coordinates: {
    type: [coordinateSchema],
    default: [],
  },
});

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Markers = mongoose.model("Markers", markerSchema);
const Coordinate = mongoose.model("Coordinates", coordinateSchema);
const User = mongoose.model("users", userSchema);
module.exports = { User, Markers, Coordinate };
