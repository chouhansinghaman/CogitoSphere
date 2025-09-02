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
      required: true, // e.g. "Mathematics", "Computer Science"
    },
    options: {
      type: [String],
      validate: {
        validator: function (val) {
          return val.length === 4; // always 4 options
        },
        message: "A question must have exactly 4 options",
      },
      required: true,
    },
    answer: {
      type: String,
      enum: ["A", "B", "C", "D"], // correct option
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
export default Question;
