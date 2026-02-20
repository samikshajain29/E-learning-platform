import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useSelector } from "react-redux";

const LectureQuestionSection = ({ lectureId, courseId, courseCreatorId }) => {
  const { userData } = useSelector((state) => state.user);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyTexts, setReplyTexts] = useState({});
  const [replyLoading, setReplyLoading] = useState({});

  // Check if current user is the course creator
  const isCourseCreator = userData?._id === courseCreatorId;

  // Fetch questions when component mounts or lectureId changes
  useEffect(() => {
    if (lectureId) {
      fetchQuestions();
    }
  }, [lectureId]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/lecture-question/questions/${lectureId}`);
      setQuestions(response.data.questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${serverUrl}/api/lecture-question/questions`,
        {
          lectureId,
          courseId,
          question: newQuestion.trim(),
        },
        { withCredentials: true }
      );

      // Add the new question to the list
      setQuestions([response.data.question, ...questions]);
      setNewQuestion("");
    } catch (error) {
      console.error("Error adding question:", error);
      alert(error.response?.data?.message || "Error adding question");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (questionId) => {
    const reply = replyTexts[questionId];
    if (!reply?.trim()) return;

    setReplyLoading(prev => ({ ...prev, [questionId]: true }));
    try {
      const response = await axios.put(
        `${serverUrl}/api/lecture-question/questions/reply/${questionId}`,
        { reply: reply.trim() },
        { withCredentials: true }
      );

      // Update the question in the list with the new reply
      setQuestions(prevQuestions =>
        prevQuestions.map(q => 
          q._id === questionId ? response.data.question : q
        )
      );

      // Clear the reply text
      setReplyTexts(prev => ({ ...prev, [questionId]: "" }));
    } catch (error) {
      console.error("Error adding reply:", error);
      alert(error.response?.data?.message || "Error adding reply");
    } finally {
      setReplyLoading(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handleReplyChange = (questionId, text) => {
    setReplyTexts(prev => ({
      ...prev,
      [questionId]: text
    }));
  };

  // Show loading state when no questions yet
  if (questions.length === 0) {
    return (
      <div className="mt-8 p-6 bg-white rounded-xl shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Questions & Answers</h3>
        
        {!isCourseCreator && userData && (
          <form onSubmit={handleAddQuestion} className="mb-6">
            <div className="flex gap-2">
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask a question about this lecture..."
                className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                rows="2"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Asking..." : "Ask"}
              </button>
            </div>
          </form>
        )}

        {isCourseCreator && (
          <p className="text-sm text-gray-600 italic">No questions yet. Students and other educators can ask questions here.</p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Questions & Answers</h3>

      {!isCourseCreator && userData && (
        <form onSubmit={handleAddQuestion} className="mb-6">
          <div className="flex gap-2">
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask a question about this lecture..."
              className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
              rows="2"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-2 py-[2px] bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Asking..." : "Ask"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question._id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-800">
                    {question.askedBy.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(question.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 text-sm mb-2">{question.question}</p>
                
                {question.reply && (
                  <div className="ml-6 pl-4 border-l-2 border-gray-300">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-800">
                        {question.repliedBy?.name || "Educator"} 
                        <span className="text-xs text-gray-500 ml-1">(Educator)</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        {question.replyCreatedAt ? new Date(question.replyCreatedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{question.reply}</p>
                  </div>
                )}

                {isCourseCreator && !question.reply && (
                  <div className="mt-3 ml-6">
                    <div className="flex gap-2">
                      <textarea
                        value={replyTexts[question._id] || ""}
                        onChange={(e) => handleReplyChange(question._id, e.target.value)}
                        placeholder="Write your reply..."
                        className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                        rows="2"
                      />
                      <button
                        onClick={() => handleReply(question._id)}
                        disabled={replyLoading[question._id]}
                        className="px-3 py-1 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-xs font-medium disabled:opacity-50"
                      >
                        {replyLoading[question._id] ? "Replying..." : "Reply"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LectureQuestionSection;