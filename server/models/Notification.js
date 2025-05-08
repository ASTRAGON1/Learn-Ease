const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient_id: { type: mongoose.Schema.Types.ObjectId }, // could be student or teacher
  recipientType: { type: String }, // "Student" or "Teacher"
  notifMessage: String,
  notifType: String,
  seen: { type: Boolean, default: false }
});

module.exports = mongoose.model("Notification", notificationSchema);
