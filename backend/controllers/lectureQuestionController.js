import LectureQuestion from "../models/lectureQuestionModel.js";
import Lecture from "../models/lectureModel.js";
import Course from "../models/courseModel.js";
import User from "../models/userModel.js";

// Add a new question to a lecture
export const addQuestion = async (req, res) => {
  try {
    const { lectureId, courseId, question } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!lectureId || !courseId || !question) {
      return res.status(400).json({ message: "Lecture ID, Course ID, and question are required" });
    }

    // Verify lecture exists
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is the course creator
    if (course.creator.toString() === userId.toString()) {
      return res.status(403).json({ 
        message: "Course creator cannot ask questions on their own lectures" 
      });
    }

    // Create the question
    const newQuestion = new LectureQuestion({
      lectureId,
      courseId,
      askedBy: userId,
      question,
    });

    await newQuestion.save();

    // Populate user data for response
    const populatedQuestion = await LectureQuestion.findById(newQuestion._id)
      .populate('askedBy', 'name photoUrl role')
      .populate('repliedBy', 'name photoUrl role');

    res.status(201).json({
      message: "Question added successfully",
      question: populatedQuestion
    });
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ message: `Failed to add question: ${error.message}` });
  }
};

// Get all questions for a specific lecture
export const getQuestionsByLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;

    // Verify lecture exists
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // Get all questions for this lecture, sorted by creation date (newest first)
    const questions = await LectureQuestion.find({ lectureId })
      .populate('askedBy', 'name photoUrl role')
      .populate('repliedBy', 'name photoUrl role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      questions
    });
  } catch (error) {
    console.error("Error getting questions:", error);
    res.status(500).json({ message: `Failed to get questions: ${error.message}` });
  }
};

// Reply to a question (only course creator can reply)
export const replyToQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { reply } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!questionId || !reply) {
      return res.status(400).json({ message: "Question ID and reply are required" });
    }

    // Get the question
    const question = await LectureQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Verify the lecture and course to check if user is the creator
    const lecture = await Lecture.findById(question.lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    const course = await Course.findById(question.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if the user is the course creator
    if (course.creator.toString() !== userId.toString()) {
      return res.status(403).json({ 
        message: "Only the course creator can reply to questions" 
      });
    }

    // Update the question with the reply
    question.reply = reply;
    question.repliedBy = userId;
    question.replyCreatedAt = new Date();
    
    await question.save();

    // Populate user data for response
    const populatedQuestion = await LectureQuestion.findById(question._id)
      .populate('askedBy', 'name photoUrl role')
      .populate('repliedBy', 'name photoUrl role');

    res.status(200).json({
      message: "Reply added successfully",
      question: populatedQuestion
    });
  } catch (error) {
    console.error("Error replying to question:", error);
    res.status(500).json({ message: `Failed to reply to question: ${error.message}` });
  }
};