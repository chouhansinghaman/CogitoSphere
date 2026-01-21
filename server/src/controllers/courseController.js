import Course from "../models/Course.js";
import { cloudinary } from "../utils/cloudinary.js";

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).populate("createdBy", "name username");
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("createdBy", "name username");
    if (course) {
      res.status(200).json({ course }); // ✅ Wrap in object
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Admin only
export const createCourse = async (req, res) => {
  const { title, description, category, content } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ message: "Please fill in all required fields" });
  }

  try {
    const course = new Course({
      title,
      description,
      category,
      content,
      createdBy: req.user._id,
      pdfUrl: req.file ? req.file.path : "",
      pdfPublicId: req.file ? req.file.filename : "",
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(500).json({ message: "Failed to create course", error: error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Admin only
export const updateCourse = async (req, res) => {
  const { title, description, category, content } = req.body;
  const { id } = req.params;

  try {
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // If a new file is uploaded, delete the old one from Cloudinary
    if (req.file && course.pdfPublicId) {
      await cloudinary.upGridGlitchGame.destroy(course.pdfPublicId);
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.category = category || course.category;
    course.content = content || course.content;

    if (req.file) {
      course.pdfUrl = req.file.path;
      course.pdfPublicId = req.file.filename;
    }

    const updatedCourse = await course.save();
    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: "Failed to update course", error: error.message });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Admin only
export const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // If a PDF exists, delete it from Cloudinary first
    if (course.pdfPublicId) {
      await cloudinary.upGridGlitchGame.destroy(course.pdfPublicId);
    }

    await course.deleteOne();
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete course", error: error.message });
  }
};