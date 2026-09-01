const Submission = require('../models/Submission');
const Assessment = require('../models/Assessment');

class SubmissionService {
  /**
   * Submit an Assignment or Quiz Attempt
   */
  static async submitAssessment(studentId, assessmentId, data) {
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      const error = new Error('Assessment not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if student already submitted (prevent duplicate submission if already graded/submitted)
    let existing = await Submission.findOne({ assessmentId, studentId });

    if (assessment.type === 'QUIZ') {
      const studentAnswers = data.answers || [];
      let totalEarned = 0;
      const gradedAnswers = [];

      assessment.questions.forEach((q, idx) => {
        const studentAns = studentAnswers.find((a) => a.questionIndex === idx);
        const selectedOption = studentAns !== undefined ? studentAns.selectedOptionIndex : -1;
        const isCorrect = selectedOption === q.correctOptionIndex;
        const points = isCorrect ? (q.points || 1) : 0;
        if (isCorrect) totalEarned += points;

        gradedAnswers.push({
          questionIndex: idx,
          selectedOptionIndex: selectedOption,
          isCorrect,
          pointsEarned: points
        });
      });

      const totalPossible = assessment.totalPoints || 100;
      const percentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
      const isPassed = percentage >= (assessment.passingScore || 50);

      if (existing) {
        existing.answers = gradedAnswers;
        existing.score = totalEarned;
        existing.totalPoints = totalPossible;
        existing.percentage = percentage;
        existing.isPassed = isPassed;
        existing.status = 'GRADED';
        existing.submittedAt = new Date();
        await existing.save();
        return existing;
      }

      const newSubmission = await Submission.create({
        assessmentId,
        studentId,
        courseId: assessment.courseId,
        status: 'GRADED',
        answers: gradedAnswers,
        score: totalEarned,
        totalPoints: totalPossible,
        percentage,
        isPassed,
        submittedAt: new Date()
      });

      return newSubmission;
    }

    // Handle Open-ended ASSIGNMENT submission
    if (existing) {
      existing.content = data.content || existing.content;
      existing.attachmentUrl = data.attachmentUrl || existing.attachmentUrl;
      existing.status = 'SUBMITTED';
      existing.submittedAt = new Date();
      await existing.save();
      return existing;
    }

    const newSubmission = await Submission.create({
      assessmentId,
      studentId,
      courseId: assessment.courseId,
      status: 'SUBMITTED',
      content: data.content || '',
      attachmentUrl: data.attachmentUrl || '',
      totalPoints: assessment.totalPoints || 100,
      submittedAt: new Date()
    });

    return newSubmission;
  }

  /**
   * Get student's submission for an assessment
   */
  static async getStudentSubmission(assessmentId, studentId) {
    const submission = await Submission.findOne({ assessmentId, studentId })
      .populate('gradedBy', 'name email');
    return submission;
  }

  /**
   * Get all submissions for an assessment (Faculty/Admin)
   */
  static async getAssessmentSubmissions(assessmentId) {
    const submissions = await Submission.find({ assessmentId })
      .populate('studentId', 'name email department')
      .populate('gradedBy', 'name email')
      .sort({ submittedAt: -1 });
    return submissions;
  }

  /**
   * Grade an assignment (Faculty/Admin)
   */
  static async gradeSubmission(submissionId, facultyId, { score, feedback }) {
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      const error = new Error('Submission not found');
      error.statusCode = 404;
      throw error;
    }

    const numericScore = Number(score);
    const percentage = submission.totalPoints > 0 ? Math.round((numericScore / submission.totalPoints) * 100) : 0;
    
    // Check passing score from assessment
    const assessment = await Assessment.findById(submission.assessmentId);
    const passingScore = assessment ? assessment.passingScore : 50;

    submission.score = numericScore;
    submission.percentage = percentage;
    submission.isPassed = percentage >= passingScore;
    submission.feedback = feedback || '';
    submission.status = 'GRADED';
    submission.gradedBy = facultyId;
    submission.gradedAt = new Date();

    await submission.save();
    return submission;
  }
}

module.exports = SubmissionService;
