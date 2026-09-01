import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import assessmentService from '../../services/assessmentService';
import {
  Clock,
  HelpCircle,
  CheckCircle,
  XCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

const QuizTakingPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Quiz taking state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [qIdx]: selectedOptionIdx }
  const [timeLeft, setTimeLeft] = useState(null); // in seconds
  const [submitting, setSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    const fetchQuizAndSubmission = async () => {
      try {
        setLoading(true);
        const [quizRes, subRes] = await Promise.all([
          assessmentService.getAssessmentById(assessmentId),
          assessmentService.getMySubmission(assessmentId).catch(() => null)
        ]);

        if (quizRes?.success) {
          setQuiz(quizRes.data);
          if (quizRes.data.timeLimitMinutes > 0) {
            setTimeLeft(quizRes.data.timeLimitMinutes * 60);
          }
        }

        if (subRes?.success && subRes.data) {
          setSubmission(subRes.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      fetchQuizAndSubmission();
    }
  }, [assessmentId]);

  // Timer countdown
  useEffect(() => {
    if (!quizStarted || submission || timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, submission, timeLeft]);

  const handleOptionSelect = (optionIdx) => {
    if (submission) return; // Prevent modification if already submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIdx
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || submitting) return;
    try {
      setSubmitting(true);
      const answersPayload = quiz.questions.map((_, idx) => ({
        questionIndex: idx,
        selectedOptionIndex: selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1
      }));

      const res = await assessmentService.submitAssessment(assessmentId, {
        answers: answersPayload
      });

      if (res?.success) {
        setSubmission(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="mt-4 text-slate-400 text-sm">Loading quiz content...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !quiz) {
    return (
      <MainLayout>
        <div className="max-w-xl mx-auto my-12 p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-white">Quiz Unavailable</h2>
          <p className="text-sm text-rose-300 mt-1">{error || 'Could not load quiz details.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-slate-800 text-slate-200 text-sm rounded-lg hover:bg-slate-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </MainLayout>
    );
  }

  // If already submitted, show result card
  if (submission) {
    const isPassed = submission.isPassed;
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
            <div className="text-center">
              <div
                className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  isPassed
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                }`}
              >
                {isPassed ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
              </div>

              <h2 className="text-2xl font-extrabold text-white">
                {isPassed ? 'Congratulations! You Passed' : 'Quiz Completed'}
              </h2>
              <p className="text-slate-400 text-sm mt-1">{quiz.title}</p>

              {/* Scorecard */}
              <div className="grid grid-cols-3 gap-4 my-8 max-w-lg mx-auto">
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                  <span className="text-xs text-slate-400 font-medium">Your Score</span>
                  <p className="text-2xl font-bold text-indigo-400 mt-1">
                    {submission.score} / {submission.totalPoints}
                  </p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                  <span className="text-xs text-slate-400 font-medium">Percentage</span>
                  <p className={`text-2xl font-bold mt-1 ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {submission.percentage}%
                  </p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                  <span className="text-xs text-slate-400 font-medium">Status</span>
                  <p className={`text-2xl font-bold mt-1 ${isPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isPassed ? 'PASSED' : 'RETRY'}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-4">
                <Link
                  to={`/courses/${quiz.courseId?._id || quiz.courseId}/assessments`}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-colors"
                >
                  Back to Assessments
                </Link>
                <button
                  onClick={() => {
                    setSubmission(null);
                    setQuizStarted(true);
                    setSelectedAnswers({});
                    if (quiz.timeLimitMinutes > 0) setTimeLeft(quiz.timeLimitMinutes * 60);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/30"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retake Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Pre-quiz briefing screen
  if (!quizStarted) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                MCQ QUIZ
              </span>
              <span className="text-xs text-slate-400 font-medium">{quiz.totalPoints} Total Points</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{quiz.title}</h1>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed">{quiz.description || 'Test your knowledge on this module.'}</p>

            <div className="my-6 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Questions:</span>
                <span className="font-semibold text-white">{quiz.questions?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Passing Score:</span>
                <span className="font-semibold text-white">{quiz.passingScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Time Limit:</span>
                <span className="font-semibold text-white">
                  {quiz.timeLimitMinutes > 0 ? `${quiz.timeLimitMinutes} minutes` : 'Unlimited'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setQuizStarted(true)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                Start Assessment Now
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Active Quiz taking experience
  const currentQuestion = quiz.questions[currentIndex];
  const isLastQuestion = currentIndex === quiz.questions.length - 1;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with Title & Timer */}
        <div className="flex items-center justify-between gap-4 mb-6 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <div>
            <h2 className="text-lg font-bold text-white">{quiz.title}</h2>
            <span className="text-xs text-slate-400">
              Question {currentIndex + 1} of {quiz.questions.length}
            </span>
          </div>

          {timeLeft !== null && (
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-mono font-bold ${
                timeLeft < 60
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6">
          <div
            className="bg-indigo-500 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Current Question Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Question {currentIndex + 1}
            </span>
            <span className="text-xs text-slate-400">{currentQuestion.points || 1} pt(s)</span>
          </div>

          <h3 className="text-lg sm:text-xl font-semibold text-white leading-relaxed mb-6">
            {currentQuestion.questionText}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentIndex] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-sm">{option}</span>
                  </div>
                  {isSelected && <CheckCircle className="w-5 h-5 text-indigo-400" />}
                </button>
              );
            })}
          </div>

          {/* Navigation & Submit footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white bg-slate-800/60 disabled:opacity-30 disabled:hover:text-slate-400"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                {submitting ? 'Calculating Score...' : 'Submit Quiz'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(quiz.questions.length - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default QuizTakingPage;
