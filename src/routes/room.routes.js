const express = require("express");
const { createCall, updateCallStatus, getCallHistory, getAllCalls } = require("../controllers/room.controller");
const { validateToken } = require("../utils/validateToken");
const router = express.Router();


// POST: Create a call
router.post("/",validateToken, createCall);

// PUT: Update call status (accepted/ended)
router.put("/:roomId/status",validateToken, updateCallStatus);

// GET: Fetch all calls
router.get('/history', validateToken, getCallHistory);
router.get('/', getAllCalls);

module.exports = router;
