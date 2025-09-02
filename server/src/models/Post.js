import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    votes: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    subject: { type: String, required: true },
    askedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answers: [answerSchema],
    votes: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
