import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Trophy, ArrowRight, Activity } from 'lucide-react';
import { api } from '../../utils/api';

const QuizModal = ({ isOpen, onClose, topic, nodeData, roadmapId, onSubmitSuccess }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  if (!isOpen) return null;

  const questions = nodeData?.quiz || [];

  const handleSelectAnswer = (option) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: option
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const calculateResults = () => {
    return questions.map((q, idx) => {
      const qText = typeof q === 'string' ? q : (q?.question || q?.text || q?.q || "Unknown Question");
      const cAnswer = typeof q === 'string' ? "A" : (q?.correct_answer || q?.correctAnswer || q?.answer || "");
      return {
        question: qText,
        selected_answer: answers[idx] || "",
        correct_answer: cAnswer,
        is_correct: answers[idx] === cAnswer
      };
    });
  };

  const handleSubmit = async () => {
    // In a real app we might put this in an API service class
    setIsSubmitting(true);
    try {
      const results = calculateResults();
      const token = localStorage.getItem('token');

      const payload = {
        roadmap_id: roadmapId,
        topic: topic,
        node_id: nodeData.id,
        questions: results
      };

      const response = await api.post('/quiz/submit', payload);

      setQuizResult(response);
      if (onSubmitSuccess) {
        onSubmitSuccess(response.score, response.xp_gained);
      }
    } catch (error) {
      console.error(error);
      // Fallback local calculation if API fails
      const results = calculateResults();
      const correct = results.filter(r => r.is_correct).length;
      setQuizResult({
        score: (correct / questions.length) * 100,
        xp_gained: correct === questions.length ? 15 : 10,
        questions: results
      });
      if (onSubmitSuccess) {
        onSubmitSuccess((correct / questions.length) * 100, correct === questions.length ? 15 : 10);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuizResult(null);
    onClose();
  };

  const currentQ = questions[currentQuestionIndex] || {};
  const qText = typeof currentQ === 'string' ? currentQ : (currentQ?.question || currentQ?.text || currentQ?.q || "Question not available");
  const options = Array.isArray(currentQ?.options) ? currentQ.options : Array.isArray(currentQ?.choices) ? currentQ.choices : ["A", "B", "C", "D"];

  const progress = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B0914]/80 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-[#151226] w-full max-w-2xl rounded-2xl border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 bg-white/5 shrink-0 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                Knowledge Check
              </h2>
              <p className="text-sm text-gray-400 mt-1">{nodeData?.label}</p>
            </div>
            {!quizResult && (
              <div className="text-sm font-medium text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                {currentQuestionIndex + 1} of {questions.length}
              </div>
            )}

          </div>

          {/* Progress Bar (Only during quiz) */}
          {!quizResult && (
            <div className="h-1 bg-white/5 w-full">
              <motion.div
                className="h-full bg-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            {!questions.length ? (
              <div className="text-center py-10">
                <p className="text-gray-400">No quiz available for this topic yet.</p>
                <button onClick={handleClose} className="mt-4 px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-xl">Close</button>
              </div>
            ) : quizResult ? (
              // RESULT SCREEN
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`p-6 rounded-2xl border text-center relative overflow-hidden ${quizResult.score >= 50 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'
                  }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10" />

                  {quizResult.score >= 50 ? (
                    <Trophy className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  ) : (
                    <XCircle className="w-16 h-16 text-rose-400 mx-auto mb-4" />
                  )}

                  <h3 className="text-2xl font-bold text-white mb-2">
                    {quizResult.score}% Score
                  </h3>
                  <p className="text-gray-300">
                    {quizResult.score >= 80 ? 'Exceptional! You have mastered this topic.' :
                      quizResult.score >= 50 ? 'Good job! You passed the milestone.' :
                        'Needs review. Try studying the core concepts again before moving forward.'}
                  </p>

                  {quizResult.xp_gained > 0 && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-medium">
                      <span className="text-xl">+</span> {quizResult.xp_gained} XP Earned
                    </div>
                  )}
                </div>

                {/* Review Answers */}
                <div className="space-y-4 mt-6">
                  <h4 className="font-semibold text-white">Review:</h4>
                  {quizResult.questions.map((q, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${q.is_correct ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
                      <p className="text-sm text-gray-200 font-medium mb-3">{i + 1}. {q.question}</p>
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5">Your answer:</span>
                          <span className={q.is_correct ? "text-emerald-400" : "text-rose-400"}>
                            {q.selected_answer || "Skipped"}
                          </span>
                        </div>
                        {!q.is_correct && (
                          <div className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">Correct answer:</span>
                            <span className="text-emerald-400">{q.correct_answer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // QUESTION SCREEN
              <div key={currentQuestionIndex} className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-medium text-white mb-6 leading-relaxed">
                  {qText}
                </h3>

                <div className="space-y-3">
                  {options.map((option, idx) => {
                    const isSelected = answers[currentQuestionIndex] === option;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectAnswer(option)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between ${isSelected
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/50'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                          }`}
                      >
                        <span className="pr-4 leading-relaxed">{option}</span>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 bg-black/20 shrink-0 flex items-center justify-between">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
              disabled={isSubmitting}
            >
              {quizResult ? 'Close' : 'Cancel'}
            </button>

            {!quizResult && (
              <button
                onClick={currentQuestionIndex === questions.length - 1 ? handleSubmit : handleNext}
                disabled={!answers[currentQuestionIndex] || isSubmitting}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${!answers[currentQuestionIndex] || isSubmitting
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]'
                  }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Evaluating...
                  </span>
                ) : currentQuestionIndex === questions.length - 1 ? (
                  'Submit Quiz'
                ) : (
                  <>Next Question <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuizModal;
