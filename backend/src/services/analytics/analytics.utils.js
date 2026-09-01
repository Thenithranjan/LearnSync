/**
 * Analytics Utility Functions
 * Safe arithmetic, weighted aggregations, null/empty state handling
 */

/**
 * Safely compute percentage
 * Returns null if total is 0 or invalid (prevents divide-by-zero, NaN, Infinity)
 */
function safePercentage(numerator, denominator, precision = 1) {
  const num = Number(numerator);
  const den = Number(denominator);

  if (!den || isNaN(den) || den <= 0 || isNaN(num)) {
    return null;
  }

  const result = (num / den) * 100;
  return Number(result.toFixed(precision));
}

/**
 * Calculate overall performance score based on the standardized 5-component formula:
 * Assignment: 30%
 * Quiz: 30%
 * Attendance: 20%
 * Learning Progress: 10%
 * Discussion Engagement: 10%
 *
 * If any component has no data (null), weights are dynamically redistributed
 * proportionally across available components to ensure fairness and explainability.
 * If all components are null, returns null.
 */
function calculateOverallScore({
  assignmentScore = null,
  quizScore = null,
  attendancePercentage = null,
  learningProgress = null,
  engagementScore = null
}) {
  const defaultWeights = {
    assignment: 0.30,
    quiz: 0.30,
    attendance: 0.20,
    learning: 0.10,
    engagement: 0.10
  };

  const components = [
    { key: 'assignment', score: assignmentScore, weight: defaultWeights.assignment },
    { key: 'quiz', score: quizScore, weight: defaultWeights.quiz },
    { key: 'attendance', score: attendancePercentage, weight: defaultWeights.attendance },
    { key: 'learning', score: learningProgress, weight: defaultWeights.learning },
    { key: 'engagement', score: engagementScore, weight: defaultWeights.engagement }
  ];

  const validComponents = components.filter((c) => c.score !== null && !isNaN(c.score));

  if (validComponents.length === 0) {
    return null;
  }

  const totalWeight = validComponents.reduce((sum, c) => sum + c.weight, 0);

  let weightedSum = 0;
  validComponents.forEach((c) => {
    // Proportional weighting if some metrics are not yet applicable
    const normalizedWeight = c.weight / totalWeight;
    weightedSum += c.score * normalizedWeight;
  });

  return Number(weightedSum.toFixed(1));
}

/**
 * Normalize discussion engagement score from raw activity counts
 * Returns a score between 0 and 100 based on threads created, replies, upvotes
 */
function calculateEngagementScore({
  threadsCreated = 0,
  repliesPosted = 0,
  upvotesReceived = 0,
  endorsedReplies = 0
}) {
  const totalActivity =
    (threadsCreated * 15) +
    (repliesPosted * 10) +
    (upvotesReceived * 5) +
    (endorsedReplies * 25);

  if (totalActivity === 0) {
    return 0;
  }

  // Cap at 100
  const normalized = Math.min(100, Math.round(totalActivity));
  return normalized;
}

/**
 * Grade bucket distribution calculator
 */
function calculateGradeDistribution(scores = []) {
  const distribution = {
    '90-100%': 0,
    '80-89%': 0,
    '70-79%': 0,
    '60-69%': 0,
    'Below 60%': 0
  };

  scores.forEach((score) => {
    if (score === null || isNaN(score)) return;
    if (score >= 90) distribution['90-100%']++;
    else if (score >= 80) distribution['80-89%']++;
    else if (score >= 70) distribution['70-79%']++;
    else if (score >= 60) distribution['60-69%']++;
    else distribution['Below 60%']++;
  });

  return distribution;
}

module.exports = {
  safePercentage,
  calculateOverallScore,
  calculateEngagementScore,
  calculateGradeDistribution
};
