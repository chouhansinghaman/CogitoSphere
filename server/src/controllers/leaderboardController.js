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

    // 1. Populate student details into the '_id' field
    await User.populate(rankings, {
      path: "_id",
      select: "name username email role avatar", // Added 'avatar' here
    });

    // 2. 🔴 THE FIX: Flatten the structure for the frontend
    // If a user was deleted, 'item._id' might be null, so we filter those out.
    const finalLeaderboard = rankings
      .filter(item => item._id !== null) 
      .map(item => ({
        _id: item._id._id,        // Student ID
        name: item._id.name,      // Pull name to top level
        username: item._id.username,
        avatar: item._id.avatar,
        avgPercentage: item.avgPercentage,
        totalQuizzes: item.totalQuizzes
      }));

    res.json(finalLeaderboard);
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
