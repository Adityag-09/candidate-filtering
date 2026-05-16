const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  skills: {
    type: [String],
    required: [true, "At least one skill is required"],
    validate: {
      validator: (v) => v.length > 0,
      message: "At least one skill is required",
    },
  },
  experience: {
    type: Number,
    required: [true, "Experience is required"],
    min: [0, "Experience cannot be negative"],
  },
  projects: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Candidate", CandidateSchema);
