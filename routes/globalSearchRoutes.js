const express = require("express");
const { globalSearch } = require("../controllers/globalSearchController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, globalSearch);

module.exports = router;
