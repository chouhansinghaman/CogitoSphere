import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";

// @desc    Create a quiz (Admin only)
// @route   POST /api/quizzes
// @access  Private/Admin
export const createQuiz = async (req, res) => {
  const { title, subject, questions } = req.body;

  try {
    // ✅ check if all question IDs exist
    const foundQuestions = await Question.find({ _id: { $in: questions } });
    if (foundQuestions.length !== questions.length) {
      return res.status(400).json({ message: "One or more questions not found" });
    }

    const quiz = await Quiz.create({
      title,
      subject,
      questions,
      createdBy: req.user._id, // admin
    });

    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Error creating quiz", error: err.message });
  }
};

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Public
export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate("createdBy", "name email role")
      .populate("questions", "title subject options answer");
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quizzes", error: err.message });
  }
};

// @desc    Update a quiz (Admin only)
// @route   PUT /api/quizzes/:id
// @access  Private/Admin
export const updateQuiz = async (req, res) => {
  const { title, subject, questions } = req.body;

  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // update fields if provided
    quiz.title = title || quiz.title;
    quiz.subject = subject || quiz.subject;

    if (questions && questions.length > 0) {
      const foundQuestions = await Question.find({ _id: { $in: questions } });
      if (foundQuestions.length !== questions.length) {
        return res.status(400).json({ message: "One or more questions not found" });
      }
      quiz.questions = questions;
    }

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

    await quiz.deleteOne();
    res.json({ message: "Quiz removed" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting quiz", error: err.message });
  }
};

// @desc    Get a single quiz with its questions
// @route   GET /api/quizzes/:id
// @access  Public
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("questions", "title subject options"); // don't send the correct answer here

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quiz", error: err.message });
  }
};
