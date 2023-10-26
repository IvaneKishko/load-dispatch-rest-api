const express = require("express");
const { check } = require("express-validator");

const loadsControllers = require("../controllers/loads-controller");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require('../middleware/check-auth')

const router = express.Router();

router.use(checkAuth);

router.get("/", loadsControllers.getLoads);

router.get("/:lid", loadsControllers.getLoadById);

router.get("/user/:uid", loadsControllers.getLoadsByUserId);

router.post(
  "/",
  fileUpload.single('image'), 
  [
    check("model").not().isEmpty(),
    check("phoneNumber").not().isEmpty(),
    check("pickupDate").not().isEmpty(),
    check("pickupLocation").not().isEmpty(),
    check("dropOffLocation").not().isEmpty(),
    check("price").not().isEmpty(),
    check("payment").not().isEmpty(),
    check("address").not().isEmpty(),
  ],
  loadsControllers.createLoad
);

router.patch(
  "/:lid",
  [check("model").not().isEmpty(), check("price").not().isEmpty()],
  loadsControllers.updateLoad
);

router.delete("/:lid", loadsControllers.deleteLoad);

module.exports = router;
