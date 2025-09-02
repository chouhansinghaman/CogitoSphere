import QuizAttempt from "../models/QuizAttempt.js";
import Quiz from "../models/Quiz.js";

// @desc    Attempt a quiz
// @route   POST /api/quiz-attempts/:quizId
// @access  Private/Student
export const attemptQuiz = async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body; // [{ question, selectedOption }]

  try {
    const quiz = await Quiz.findById(quizId).populate("questions");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    let score = 0;
    const processedAnswers = quiz.questions.map((q) => {
      const userAnswer = answers.find((a) => String(a.question) === String(q._id));
      const isCorrect = userAnswer && userAnswer.selectedOption === q.answer;

      if (isCorrect) score++;

      return {
        question: q._id,
        selectedOption: userAnswer ? userAnswer.selectedOption : null,
        isCorrect,
      };
    });

    const attempt = await QuizAttempt.create({
      student: req.user._id,
      quiz: quiz._id,
      answers: processedAnswers,
      score,
      totalQuestions: quiz.questions.length,
      percentage: (score / quiz.questions.length) * 100,
    });

    res.status(201).json(attempt);
  } catch (err) {
    res.status(500).json({ message: "Error attempting quiz", error: err.message });
  }
};

// @desc    Get my quiz attempts
// @route   GET /api/quiz-attempts/my
// @access  Private/Student
export const getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ student: req.user._id })
      .populate("quiz", "title subject")
      .sort({ createdAt: -1 });

    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching attempts", error: err.message });
  }
};
