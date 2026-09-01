import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import assessmentService from '../../services/assessmentService';
import {
  FileText,
  HelpCircle,
  Plus,
  Trash2,
  Save,
  ChevronLeft,
  Calendar,
  Clock,
  Award,
  AlertCircle
} from 'lucide-react';

const CreateAssessmentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [type, setType] = useState('ASSIGNMENT'); // 'ASSIGNMENT' or 'QUIZ'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [totalPoints, setTotalPoints] = useState(100);
  const [passingScore, setPassingScore] = useState(50);
  const [dueDate, setDueDate] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  
  // MCQ Questions for Quiz
  const [questions, setQuestions] = useState([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      points: 5,
      explanation: ''
    }
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        points: 5,
        explanation: ''
      }
    ]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].options[optIndex] = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the assessment.');
      return;
    }

    if (type === 'QUIZ') {
      if (questions.length === 0) {
        setError('A quiz must contain at least one question.');
        return;
      }
      for (let i = 0; i < questions.length; i++) {
        if (!questions[i].questionText.trim()) {
          setError(`Question #${i + 1} text cannot be blank.`);
          return;
        }
        if (questions[i].options.some((opt) => !opt.trim())) {
          setError(`All 4 options in Question #${i + 1} must be filled.`);
          return;
        }
      }
    }

    try {
      setSaving(true);
      setError('');
      const payload = {
        title,
        description,
        type,
        instructions,
        totalPoints: Number(totalPoints),
        passingScore: Number(passingScore),
        dueDate: dueDate ? new Date(dueDate) : null,
        timeLimitMinutes: type === 'QUIZ' ? Number(timeLimitMinutes) : 0,
        questions: type === 'QUIZ' ? questions : []
      };

      const res = await assessmentService.createAssessment(courseId, payload);
      if (res?.success) {
        navigate(`/courses/${courseId}/assessments`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assessment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
          <Link to={`/courses/${courseId}/assessments`} className="hover:text-slate-200 transition-colors flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back to Assessments
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Create Assessment</h1>
          <p className="mt-1 text-slate-400 text-sm">
            Publish a new assignment or timed quiz for your students.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-2 text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Assessment Type Selector */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType('ASSIGNMENT')}
              className={`p-5 rounded-2xl border flex items-center gap-4 transition-all ${
                type === 'ASSIGNMENT'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-base font-bold block">Assignment</span>
                <span className="text-xs text-slate-400">Open-ended submissions & manual grading</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setType('QUIZ')}
              className={`p-5 rounded-2xl border flex items-center gap-4 transition-all ${
                type === 'QUIZ'
                  ? 'bg-amber-600/20 border-amber-500 text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-base font-bold block">Quiz / MCQs</span>
                <span className="text-xs text-slate-400">Automated instant grading & timers</span>
              </div>
            </button>
          </div>

          {/* General Metadata Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
            <h3 className="text-lg font-bold text-white">General Information</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Module 1: Data Structures Quiz"
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/80 rounded-2xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Description / Overview
              </label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of what this coursework covers..."
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/80 rounded-2xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              ></textarea>
            </div>

            {type === 'ASSIGNMENT' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Detailed Instructions & Grading Rubric
                </label>
                <textarea
                  rows="4"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Step-by-step instructions, submission criteria, format guidelines..."
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/80 rounded-2xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                ></textarea>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Due Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {type === 'QUIZ' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    Time Limit (Minutes, 0 = no limit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          {/* MCQ Question Builder (For Quiz) */}
          {type === 'QUIZ' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                  Quiz Questions ({questions.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </div>

              {questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Question #{qIdx + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      value={q.questionText}
                      onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                      placeholder="e.g. Which data structure follows the LIFO principle?"
                      className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-amber-500 transition-colors font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correctOpt-${qIdx}`}
                          checked={q.correctOptionIndex === optIdx}
                          onChange={() => handleQuestionChange(qIdx, 'correctOptionIndex', optIdx)}
                          className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                          title="Select as correct answer"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          className="w-full px-3 py-2 bg-slate-800/40 border border-slate-700/60 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Answer Explanation (optional)
                    </label>
                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                      placeholder="e.g. A Stack follows Last In, First Out (LIFO)."
                      className="w-full px-3 py-2 bg-slate-800/40 border border-slate-700/60 rounded-xl text-slate-400 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-slate-400 hover:text-slate-200 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Publishing...' : 'Publish Assessment'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateAssessmentPage;
