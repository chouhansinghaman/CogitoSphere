// controllers/quizController.js

import Quiz from "../models/Quiz.js";
import Submission from "../models/Submission.js";

// @desc    Create a new quiz (Admin only)
// @route   POST /api/quizzes
// @access  Private/Admin
export const createQuiz = async (req, res) => {
  // 1. Destructure 'level' instead of 'questions'
  const { title, subject, level } = req.body;

  // 2. Update the validation to check for 'level'
  if (!title || !subject || !level) {
    return res.status(400).json({ message: "Please provide a title, subject, and difficulty level." });
  }

  try {
    const quizExists = await Quiz.findOne({ title, subject });
    if (quizExists) {
      return res.status(400).json({ message: "A quiz with this title and subject already exists." });
    }

    // 3. Pass the new 'level' field to the database
    const quiz = await Quiz.create({
      title,
      subject,
      level,
      createdBy: req.user._id,
      questions: [], // Start with an empty array of questions
    });

    res.status(201).json(quiz);
  } catch (err) {
    console.error("❌ Error in createQuiz:", err);
    res.status(500).json({ message: "Error creating quiz", error: err.message });
  }
};

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Public
export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({})
      .populate("createdBy", "name email") // Show who created it
      .populate("questions", "title") // Show question titles
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quizzes", error: err.message });
  }
};

// @desc    Get a single quiz by its ID (for students to take)
// @route   GET /api/quizzes/:id
// @access  Public
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate({
      path: 'questions',
      // IMPORTANT: Select only the fields students need. NEVER send the 'answer'.
      select: 'title options subject _id' 
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quiz details", error: err.message });
  }
};

// @desc    Update a quiz (Admin only)
// @route   PUT /api/quizzes/:id
// @access  Private/Admin
export const updateQuiz = async (req, res) => {
  try {
    const { title, subject, level, questions } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    quiz.title = title || quiz.title;
    quiz.subject = subject || quiz.subject;
    quiz.level = level || quiz.level;

    // This line correctly updates the questions array
    quiz.questions = questions; 

    const updatedQuiz = await quiz.save();
    res.json(updatedQuiz);
  } catch (err) {
    res.status(500).json({ message: "Error updating quiz", error: err.message });
  }
};

// @desc    Delete a quiz (Admin only)
// @route   DELETE /api/quizzes/:id
// @access  Private/Admin
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    
    // Also delete all submissions associated with this quiz to keep DB clean
    await Submission.deleteMany({ quiz: req.params.id });

    await quiz.deleteOne();
    res.json({ message: "Quiz and all associated submissions removed successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting quiz", error: err.message });
  }
};