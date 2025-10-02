import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import Submission from "../models/Submission.js";

// @desc    Submit quiz attempt (Student)
// @route   POST /api/submissions/:quizId
// @access  Private/Student
export const submitQuiz = async (req, res) => {
  const { answers, timeTaken } = req.body;
  const { quizId } = req.params;

  try {
    const quiz = await Quiz.findById(quizId).populate("questions");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let correctCount = 0;
    const processedAnswers = [];

    // Use a for...of loop to handle async operations correctly if needed
    for (const ans of answers) {
      const question = await Question.findById(ans.question);
      if (!question) continue; // Skip if question ID is invalid

      const isCorrect = ans.selectedOption && question.answer === ans.selectedOption;
      if (isCorrect) correctCount++;

      processedAnswers.push({
        question: question._id,
        selectedOption: ans.selectedOption || null,
        isCorrect,
      });
    }

    const totalQuestions = quiz.questions.length;
    const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    const submission = await Submission.create({
      quiz: quiz._id,
      student: req.user._id,
      answers: processedAnswers,
      score: correctCount,
      totalQuestions,
      percentage,
      timeTaken,
    });

    res.status(201).json(submission);
  } catch (err) {
    console.error("❌ Error in submitQuiz:", err);
    res.status(500).json({ message: "Error submitting quiz", error: err.message });
  }
};

// @desc    Get all submissions of a student
// @route   GET /api/submissions/my
// @access  Private/Student
export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate("quiz", "title subject")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching submissions", error: err.message });
  }
};

// @desc    Get all submissions for a specific quiz (Admin only)
// @route   GET /api/submissions/quiz/:quizId
// @access  Private/Admin
export const getQuizSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ quiz: req.params.quizId })
      .populate("student", "name username email")
      .sort({ createdAt: -1 });

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ message: "No submissions found for this quiz" });
    }

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quiz submissions", error: err.message });
  }
};