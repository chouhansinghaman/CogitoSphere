import Question from "../models/Question.js";

// @desc    Create MCQ (Admin only)
// @route   POST /api/questions
// @access  Private/Admin
export const createQuestion = async (req, res) => {
  const { title, subject, options, answer } = req.body;

  try {
    // Check if a question with same title & subject already exists
    const existingQuestion = await Question.findOne({ title, subject });
    if (existingQuestion) {
      return res.status(400).json({ message: "❌ This question already exists in the database" });
    }

    const question = await Question.create({
      title,
      subject,
      options,
      answer,
      createdBy: req.user._id, // admin who created it
    });

    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: "Error creating question", error: err.message });
  }
};

// @desc    Get all questions (students & admins can view)
// @route   GET /api/questions
// @access  Public
export const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching questions", error: err.message });
  }
};

// @desc    Update question (Admin only)
// @route   PUT /api/questions/:id
// @access  Private/Admin
export const updateQuestion = async (req, res) => {
  const { title, subject, options, answer } = req.body;

  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    question.title = title || question.title;
    question.subject = subject || question.subject;
    question.options = options || question.options;
    question.answer = answer || question.answer;

    const updatedQuestion = await question.save();
    res.json(updatedQuestion);
  } catch (err) {
    res.status(500).json({ message: "Error updating question", error: err.message });
  }
};

// @desc    Delete question (Admin only)
// @route   DELETE /api/questions/:id
// @access  Private/Admin
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    await question.deleteOne();
    res.json({ message: "Question removed" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting question", error: err.message });
  }
};
