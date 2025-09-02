import Submission from "../models/Submission.js";
import User from "../models/User.js";

// @desc    Get leaderboard (top students by average percentage)
// @route   GET /api/leaderboard
// @access  Public
export const getLeaderboard = async (req, res) => {
  try {
    // aggregate submissions by student
    const rankings = await Submission.aggregate([
      {
        $group: {
          _id: "$student",
          avgPercentage: { $avg: "$percentage" },
          totalQuizzes: { $sum: 1 },
        },
      },
      { $sort: { avgPercentage: -1, totalQuizzes: -1 } }, // best performers first
      { $limit: 20 }, // top 20
    ]);

    // attach student details
    const leaderboard = await User.populate(rankings, {
      path: "_id",
      select: "name userName email role",
    });

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaderboard", error: err.message });
  }
};
