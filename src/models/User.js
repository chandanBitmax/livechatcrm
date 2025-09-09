const mongoose = require("mongoose");
const getIndiaTime = require("../utils/timezone");

const UserSchema = new mongoose.Schema(
  {
    employee_id: {
      type: String,
      trim: true
    },
    user_name: {
      type: String,
      required: true,
      trim: true
    },
    name:  {
      type: String,
      required: true,
      trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    mobile: {
      type: String,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["Admin", "Agent", "QA","Customer"],
      default: "Customer"
    },
    department: {
      type: String,
      enum: ["Accounts", "Technicals", "Billings", "Supports"]
    },

    // Status fields
    is_active: { type: Boolean, default: false },
    workStatus: {
      type: String,
      enum: ["active", "break", "offline"],
      default: "offline"
    },
    is_typing: { type: Boolean, default: false },

    // Timestamps for login & break
    login_time: { type: Date,default:getIndiaTime },
    break_time: { type: Date,default:getIndiaTime },

    // Break logs
    breakLogs: [
      {
        start: { type: Date,default:getIndiaTime },
        end: { type: Date,default:getIndiaTime },
        duration: { type: Number } 
      }
    ],

    // Profile
    profileImage: { type: String, default: null },

    // Creator reference
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // Location info
    ip: { type: String, default: null },
    location: {
      country: { type: String, default: null },
      region: { type: String, default: null },
      city: { type: String, default: null },
      isp: { type: String, default: null },
      timezone: { type: String, default: null },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
