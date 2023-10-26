const fs = require("fs");

const { v4: uuid } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error.js");
const getCoordsForAddress = require("../util/location.js");
const Load = require("../models/load.js");
const User = require("../models/user.js");
const { default: mongoose } = require("mongoose");

const getLoadById = async (req, res, next) => {
  const loadId = req.params.lid;

  let load;
  try {
    load = await Load.findById(loadId);
  } catch (err) {
    const error = new HttpError(
      "Could not find a load, something went wrong",
      500
    );
    return next(error);
  }

  if (!load) {
    const error = new HttpError("Could not find load or provided id.", 404);
    return next(error);
  }

  res.json({ load: load.toObject({ getters: true }) });
};

const getLoads = async (req, res, next) => {
  let loads;
  try {
    loads = await Load.find();
  } catch (err) {
    const error = new HttpError(
      "Could not find a load, something went wrong",
      500
    );
    return next(error);
  }

  if (!loads) {
    const error = new HttpError("Could not find load or provided id.", 404);
    return next(error);
  }

  res.json({ loads: loads.map((load) => load.toObject({ getters: true })) });
};

const getLoadsByUserId = async (req, res, next) => {
  console.log('getloadsbyuserid')
  const userId = req.params.uid;

  let loads;
  try {
    loads = await Load.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(
      "Could not find a load for this user, something went wrong",
      500
    );
    return next(error);
  }

  if (!loads) {
    const error = new HttpError("Could not find load or provided id.", 404);
    return next(error);
  }
  console.log(loads)
  res.json({ loads: loads.map((load) => load.toObject({ getters: true })) });
};

const createLoad = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const {
    model,
    pickupDate,
    pickupLocation,
    dropOffLocation,
    price,
    phoneNumber,
    payment,
    address,
    companyName,
  } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdLoad = new Load({
    model,
    pickupDate,
    pickupLocation,
    dropOffLocation,
    price,
    phoneNumber,
    payment,
    address,
    companyName,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    console.log(err);
    const error = new HttpError("Creating load failed, please try again", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Couldn't find user for provided id", 404);
    return next(error);
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdLoad.save({ session: sess });
    user.loads.push(createdLoad);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err)
    const error = new HttpError("Creating load failed, please try again", 500);
    return next(error);
  }

  res.status(201).json({ load: createdLoad });
};

const updateLoad = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return new HttpError("Invalid inputs passed, please check your data.", 422);
  }

  const { model, price } = req.body;
  const loadId = req.params.lid;

  let load;
  try {
    load = await Load.findById(loadId);
  } catch (err) {
    const error = new HttpError(
      "Couldn't update load, something went wrong",
      500
    );
    return next(error);
  }

  if (load.creator.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this load", 401);
    return next(error);
  }

  load.model = model;
  load.price = price;
  console.log(load);
  try {
    await load.save();
    console.log("saved");
  } catch (err) {
    const error = new HttpError(
      "Could not update place something went wrong",
      500
    );
    return next(error);
  }

  res.status(200).json({ load: load.toObject({ getters: true }) });
};

const deleteLoad = async (req, res, next) => {
  const loadId = req.params.lid;

  let load;
  try {
    load = await Load.findById(loadId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Couldn't delete load, something went wrong",
      500
    );
    return next(error);
  }

  if (!load) {
    const error = new HttpError("Could not find load, for this id", 404);
    return next(error);
  }

  if (load.creator.id !== req.userData.userId) {
    const error = new HttpError("You are not allowed to delete this load", 401);
    return next(error);
  }

  const imagePath = load.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await Load.findByIdAndRemove(loadId, { session: sess });
    load.creator.loads.pull(load);
    await load.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Couldn't delete load, something went wrong",
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Deleted load" });
};

exports.getLoadById = getLoadById;
exports.getLoads = getLoads;
exports.getLoadsByUserId = getLoadsByUserId;
exports.createLoad = createLoad;
exports.updateLoad = updateLoad;
exports.deleteLoad = deleteLoad;
