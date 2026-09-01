/**
 * Intervention & Improvement Utility Rules & Transition Safeguards
 */

const ALLOWED_STATUS_TRANSITIONS = {
  PENDING: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['ACKNOWLEDGED', 'IN_PROGRESS', 'CANCELLED', 'OVERDUE'],
  ACKNOWLEDGED: ['IN_PROGRESS', 'CANCELLED', 'OVERDUE'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED', 'OVERDUE'],
  COMPLETED: ['REVIEWED'],
  REVIEWED: [],
  CANCELLED: [],
  OVERDUE: ['ACKNOWLEDGED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
};

const IMPROVEMENT_THRESHOLDS = {
  significant: 15,
  moderate: 5,
  decline: -5
};

/**
 * Validate status transition according to closed-loop state machine
 */
function isValidStatusTransition(currentStatus, targetStatus) {
  if (currentStatus === targetStatus) return true;
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

/**
 * Classify quantitative improvement score gain
 */
function classifyImprovement(improvement) {
  if (improvement === null || improvement === undefined || isNaN(improvement)) {
    return 'PENDING';
  }
  if (improvement >= IMPROVEMENT_THRESHOLDS.significant) {
    return 'SIGNIFICANT_IMPROVEMENT';
  }
  if (improvement >= IMPROVEMENT_THRESHOLDS.moderate) {
    return 'MODERATE_IMPROVEMENT';
  }
  if (improvement <= IMPROVEMENT_THRESHOLDS.decline) {
    return 'DECLINE';
  }
  return 'NO_SIGNIFICANT_CHANGE';
}

/**
 * Map improvement classification to controlled human-readable outcome
 */
function mapClassificationToOutcome(classification) {
  switch (classification) {
    case 'SIGNIFICANT_IMPROVEMENT':
      return 'IMPROVED';
    case 'MODERATE_IMPROVEMENT':
      return 'PARTIALLY_IMPROVED';
    case 'NO_SIGNIFICANT_CHANGE':
      return 'NO_SIGNIFICANT_CHANGE';
    case 'DECLINE':
      return 'FURTHER_SUPPORT_REQUIRED';
    default:
      return 'PENDING';
  }
}

module.exports = {
  ALLOWED_STATUS_TRANSITIONS,
  IMPROVEMENT_THRESHOLDS,
  isValidStatusTransition,
  classifyImprovement,
  mapClassificationToOutcome
};
