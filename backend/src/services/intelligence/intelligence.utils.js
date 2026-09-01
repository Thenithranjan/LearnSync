/**
 * Academic Intelligence Engine Constants and Utilities
 * Configurable thresholds, standard risk weights, and evidence classifications
 */

const TOPIC_THRESHOLDS = {
  strong: 75,
  developing: 60,
  needsImprovement: 40
};

const RISK_WEIGHTS = {
  quiz: 0.25,
  assignment: 0.20,
  attendance: 0.20,
  learningProgress: 0.15,
  engagement: 0.10,
  trend: 0.10
};

const MIN_QUESTIONS_FOR_EVIDENCE = 3;

/**
 * Determine evidence level based on attempted sample size
 */
function getEvidenceLevel(questionsCount) {
  if (!questionsCount || questionsCount < MIN_QUESTIONS_FOR_EVIDENCE) {
    return 'INSUFFICIENT';
  }
  if (questionsCount >= 10) {
    return 'HIGH';
  }
  if (questionsCount >= 5) {
    return 'MEDIUM';
  }
  return 'LOW';
}

/**
 * Determine learning gap severity from topic accuracy and sample size
 */
function getTopicSeverity(accuracy, questionsCount) {
  if (questionsCount < MIN_QUESTIONS_FOR_EVIDENCE) {
    return 'INSUFFICIENT_DATA';
  }
  if (accuracy < TOPIC_THRESHOLDS.needsImprovement) {
    return 'HIGH';
  }
  if (accuracy < TOPIC_THRESHOLDS.developing) {
    return 'MEDIUM';
  }
  if (accuracy < TOPIC_THRESHOLDS.strong) {
    return 'LOW';
  }
  return null; // Strong / No gap
}

/**
 * Determine performance trend from chronological assessment scores
 * Returns: 'IMPROVING', 'DECLINING', 'STABLE', or 'INSUFFICIENT_DATA'
 */
function analyzePerformanceTrend(scores = []) {
  if (!Array.isArray(scores) || scores.length < 2) {
    return {
      trend: 'INSUFFICIENT_DATA',
      change: 0,
      riskFactorContribution: 5.0 // Neutral
    };
  }

  // Compare second half average with first half average or first and last
  const first = scores[0];
  const last = scores[scores.length - 1];
  const delta = last - first;

  if (delta >= 10) {
    return {
      trend: 'IMPROVING',
      change: delta,
      riskFactorContribution: 1.0 // Low risk
    };
  } else if (delta <= -10) {
    return {
      trend: 'DECLINING',
      change: delta,
      riskFactorContribution: 10.0 // High risk
    };
  }

  return {
    trend: 'STABLE',
    change: delta,
    riskFactorContribution: 5.0 // Medium
  };
}

/**
 * Convert numerical risk score (0-100) to standard level
 */
function getRiskLevel(score) {
  if (score === null || score === undefined || isNaN(score)) {
    return 'INSUFFICIENT_DATA';
  }
  if (score <= 30) return 'LOW';
  if (score <= 60) return 'MODERATE';
  if (score <= 80) return 'HIGH';
  return 'CRITICAL';
}

module.exports = {
  TOPIC_THRESHOLDS,
  RISK_WEIGHTS,
  MIN_QUESTIONS_FOR_EVIDENCE,
  getEvidenceLevel,
  getTopicSeverity,
  analyzePerformanceTrend,
  getRiskLevel
};
