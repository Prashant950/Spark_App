const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["LIKE", "SUPERLIKE", "DISLIKE", "MATCHED"],
      default: "LIKE",
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Prevent duplicate likes
likeSchema.index({ sender: 1, receiver: 1 }, { unique: true });

module.exports = mongoose.model("Like", likeSchema);