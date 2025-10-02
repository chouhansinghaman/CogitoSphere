import Post from "../models/Post.js";

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  const { title, body, subject } = req.body;
  if (!title || !body || !subject) {
    return res.status(400).json({ message: "Please provide all required fields." });
  }

  try {
    const post = await Post.create({
      title,
      body,
      subject,
      askedBy: req.user._id // req.user is from your 'protect' middleware
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error creating post", error: err.message });
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("askedBy", "username") // Populates the post author's username
      .populate({ // ✨ **UPDATED:** This now also populates the username for each answer
        path: "answers",
        populate: {
          path: "answeredBy",
          select: "username"
        }
      })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching posts", error: err.message });
  }
};

// @desc    Add an answer to a post
// @route   POST /api/posts/:id/answer
// @access  Private
export const addAnswer = async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: "Answer text cannot be empty." });
  }

  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newAnswer = {
      text,
      answeredBy: req.user._id
    };

    post.answers.push(newAnswer);
    await post.save();
    
    // We need to re-populate the latest answer to send it back to the client
    const updatedPost = await Post.findById(post._id)
      .populate("askedBy", "username")
      .populate({
        path: "answers",
        populate: {
          path: "answeredBy",
          select: "username"
        }
      });

    res.status(201).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: "Server error adding answer", error: err.message });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (Author or Admin)
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user is the author of the post OR if the user is an admin
    // Assumes your req.user object has a 'role' property, e.g., req.user.role === 'admin'
    const isAuthor = post.askedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "User not authorized to delete this post" });
    }
    
    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: "Post removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error deleting post", error: err.message });
  }
};