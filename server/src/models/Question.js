// models/Question.js
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
    },
    options: {
      type: [String],
      validate: {
        validator: function (val) {
          return val.length === 4;
        },
        message: "A question must have exactly 4 options",
      },
      required: true,
    },
    answer: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // NEW: reference to quiz
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
export default Question;
