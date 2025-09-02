import Post from "../models/Post.js";

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  const { title, body, subject } = req.body;
  try {
    const post = await Post.create({
      title,
      body,
      subject,
      askedBy: req.user._id
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Error creating post", error: err.message });
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("askedBy", "userName")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching posts", error: err.message });
  }
};

// @desc    Answer a post
// @route   POST /api/posts/:id/answer
// @access  Private
export const addAnswer = async (req, res) => {
  const { text } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newAnswer = {
      text,
      answeredBy: req.user._id
    };

    post.answers.push(newAnswer);
    await post.save();

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Error adding answer", error: err.message });
  }
};

// @desc    Upvote or downvote post
// @route   PUT /api/posts/:id/vote
// @access  Private
export const votePost = async (req, res) => {
  const { vote } = req.body; // +1 or -1
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.votes += vote;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Error voting post", error: err.message });
  }
};
