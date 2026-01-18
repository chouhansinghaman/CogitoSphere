import Project from "../models/Project.js";

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Student)
export const createProject = async (req, res) => {
  const { title, description, techStack, githubLink, liveDemoLink } = req.body;

  try {
    const project = new Project({
      title,
      description,
      techStack,
      githubLink,
      liveDemoLink,
      user: req.user._id, // Gets ID from the logged-in user (via middleware)
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: "Server Error: Could not create project" });
  }
};

// @desc    Get all projects (For Dashboard)
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    // .populate("user") fetches the name/email of the student who posted it
    const projects = await Project.find({}).populate("user", "name email");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server Error: Could not fetch projects" });
  }
};