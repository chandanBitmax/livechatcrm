const Room = require("../models/Room");
const { v4: uuidv4 } = require("uuid");

// ✅ Create a new call
exports.createCall = async (req, res) => {
  try {
    const callerId = req.user.id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ success: false, message: "Receiver ID is required" });
    }

    const roomId = uuidv4();

    const newCall = await Room.create({
      roomId,
      participants: [
        { userId: callerId, role: "caller" },
        { userId: receiverId, role: "receiver" }
      ],
      status: "ringing"
    });

    res.status(201).json({ success: true, data: newCall });
  } catch (error) {
    console.error("Create Call Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Update call status
exports.updateCallStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const validStatuses = ["accepted", "ended", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid call status" });
    }

    const call = await Room.findOne({ roomId });
    if (!call) {
      return res.status(404).json({ success: false, message: "Call not found" });
    }

    switch (status) {
      case "accepted": {
        const receiver = call.participants.find((p) => p.role === "receiver");
        if (!receiver || receiver.userId.toString() !== userId) {
          return res.status(403).json({ success: false, message: "Only the receiver can accept" });
        }
        call.startedAt = new Date();
        break;
      }

      case "ended":
      case "rejected": {
        call.endedAt = new Date();
        call.duration = call.startedAt
          ? Math.floor((call.endedAt - call.startedAt) / 1000)
          : 0;
        break;
      }
    }

    call.status = status;
    await call.save();

    res.json({ success: true, data: call });
  } catch (error) {
    console.error("Update Call Status Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ✅ Get call history
exports.getCallHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await Room.find({ "participants.userId": userId })
      .populate("participants.userId", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: history });
  } catch (error) {
    console.error("Get Call History Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get all calls (Admin)
exports.getAllCalls = async (req, res) => {
  try {
    const calls = await Room.find()
      .populate("participants.userId", "name email profileImage")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: calls });
  } catch (error) {
    console.error("Get All Calls Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
