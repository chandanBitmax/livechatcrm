const mongoose=require("mongoose");
const getIndiaTime = require("../utils/timezone");

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  subject: String,
  message: String,
  status: { type: String,enum:["Open","In Progress","Resolved","Escalated"], default: "Open" }, // Open, In Progress, Resolved, Escalated
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  forwardedTo: [
    {
      agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      forwardedAt: { type: Date, default:getIndiaTime }
    }
  ],
  replies: [
    {
      message: String,
      from: String, 
      createdAt: { type: Date, default:getIndiaTime }
    }
  ],
  createdAt: {
    type: Date,
    default: getIndiaTime
  }
});

module.exports=mongoose.model("Email",ticketSchema);