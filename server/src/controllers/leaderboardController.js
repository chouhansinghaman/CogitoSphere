import Submission from "../models/Submission.js";
import User from "../models/User.js";

// GET /api/leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const rankings = await Submission.aggregate([
      {
        $group: {
          _id: "$student",
          avgPercentage: { $avg: "$percentage" },
          totalQuizzes: { $sum: 1 },
        },
      },
      { $sort: { avgPercentage: -1, totalQuizzes: -1 } },
      { $limit: 20 },
    ]);

    // Populate student details
    const leaderboard = await User.populate(rankings, {
      path: "_id",
      select: "name username email role",
    });

    res.json(leaderboard);
  } catch (err) {
    console.error("❌ Error fetching leaderboard:", err);
    res.status(500).json({ message: "Error fetching leaderboard", error: err.message });
  }
};

// Remove all submissions of a student
export const removeStudentLeaderboard = async (req, res) => {
  const { studentId } = req.params;
  try {
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    await Submission.deleteMany({ student: studentId });

    res.json({ message: `All submissions of ${student.name} have been removed.` });
  } catch (err) {
    res.status(500).json({ message: "Error removing student submissions", error: err.message });
  }
};
