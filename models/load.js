const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const loadSchema = new Schema({
  model: { type: String, required: true },
  pickupDate: { type: String, required: true },
  pickupLocation: { type: String, required: true },
  dropOffLocation: { type: String, required: true },
  price: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  payment: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  image: { type: String, required: true },
  companyName: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
});

module.exports = mongoose.mongoose.model("Load", loadSchema);
