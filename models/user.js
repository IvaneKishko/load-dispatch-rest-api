const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  companyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  phoneNumber: { type: String, required: true },
  image: { type: String, required: true },
  loads: [{ type: mongoose.Types.ObjectId, required: true, ref: "Load" }],
  role: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.mongoose.model("User", userSchema);
