const mongoose = require("mongoose");
const getIndiaTime = require("../utils/timezone");

const replySchema = new mongoose.Schema({
  message: String,
  from: String, // "agent" or "customer"
  senderEmail: String,
  createdAt: { type: Date, default: getIndiaTime },
});

const forwardSchema = new mongoose.Schema({
  fromAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  toAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  forwardedAt: { type: Date, default: getIndiaTime },
});

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  customerEmail: { type: String },
  agentId: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" },],
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subject: String,
  message: String,
  replies: [replySchema],
  forwardedTo: [forwardSchema],
  status: { type: String, enum: ["Open","In Progress", "Escalated","Resolved"], default: "Open" },
  createdAt: { type: Date, default: getIndiaTime },
});

module.exports = mongoose.model("Ticket", ticketSchema);
