/**
 * Utility functions for consistent API JSON responses across EduPulse backend.
 */

const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const responsePayload = {
    success: true,
    message
  };

  if (data !== null && data !== undefined) {
    if (typeof data === 'object' && !Array.isArray(data)) {
      Object.assign(responsePayload, data);
    } else {
      responsePayload.data = data;
    }
  }

  return res.status(statusCode).json(responsePayload);
};

const sendError = (res, statusCode = 400, message = 'An error occurred', errors = null) => {
  const responsePayload = {
    success: false,
    message
  };

  if (errors) {
    responsePayload.errors = errors;
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = {
  sendSuccess,
  sendError
};
