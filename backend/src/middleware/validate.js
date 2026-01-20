const { body, query, param, validationResult } = require('express-validator');

/**
 * Validation rules for registration
 * (No input required for registration since token is auto-generated)
 */
const validateRegistration = [
  // Optional: Add any future registration fields here
];

/**
 * Validation rules for login
 */
const validateLogin = [
  body('accessToken')
    .trim()
    .notEmpty()
    .withMessage('Access token is required')
    .isLength({ min: 64, max: 128 })
    .withMessage('Access token must be 64-128 characters')
    .matches(/^[a-f0-9]+$/i)
    .withMessage('Invalid token format (hex characters only)')
];

/**
 * Validation rules for profile setup
 */
const validateProfileSetup = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Username can only contain letters, numbers, dots, hyphens, and underscores'),
  
  body('avatar')
    .optional()
    .isString()
    .withMessage('Avatar must be a string')
    .isLength({ min: 1, max: 2 })
    .withMessage('Avatar must be an emoji (1-2 characters)')
];

/**
 * Validation rules for preferences
 */
const validatePreferences = [
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'system'])
    .withMessage('Theme must be light, dark, or system'),
  
  body('currency')
    .optional()
    .isString()
    .withMessage('Currency must be a string')
    .isLength({ max: 5 })
    .withMessage('Currency symbol too long')
];

/**
 * Validation rules for section creation
 */
const validateCreateSection = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Section name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Section name must be between 1 and 50 characters'),
  
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number'),
  
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  
  body('theme.color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Invalid hex color code'),
  
  body('theme.icon')
    .optional()
    .isLength({ min: 1, max: 2 })
    .withMessage('Icon must be an emoji (1-2 characters)'),
  
  body('theme.name')
    .optional()
    .isIn(['Blue', 'Green', 'Red', 'Purple', 'Yellow', 'Pink', 'Indigo', 'Gray'])
    .withMessage('Invalid theme name')
];

/**
 * Validation rules for bill creation
 */
const validateCreateBill = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Bill name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Bill name must be between 1 and 100 characters'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .custom((value) => {
      // Allow numbers or strings that can be parsed
      const num = parseFloat(value);
      return !isNaN(num) && isFinite(num);
    })
    .withMessage('Amount must be a valid number'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('tag')
    .optional()
    .isLength({ min: 1, max: 2 })
    .withMessage('Tag must be an emoji (1-2 characters)'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in ISO format (YYYY-MM-DD)'),
  
  body('section')
    .notEmpty()
    .withMessage('Section ID is required')
    .isMongoId()
    .withMessage('Invalid section ID format')
];

/**
 * Validation rules for bill queries/filters
 */
const validateBillQuery = [
  query('section')
    .optional()
    .isMongoId()
    .withMessage('Invalid section ID format'),
  
  query('tag')
    .optional()
    .isLength({ max: 2 })
    .withMessage('Tag must be an emoji'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in ISO format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in ISO format'),
  
  query('timeFrame')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'yearly', 'one-time'])
    .withMessage('Invalid time frame'),
  
  query('minAmount')
    .optional()
    .isFloat()
    .withMessage('Minimum amount must be a number'),
  
  query('maxAmount')
    .optional()
    .isFloat()
    .withMessage('Maximum amount must be a number'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['date', 'amount', 'name', 'createdAt'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

/**
 * Validation rules for section queries
 */
const validateSectionQuery = [
  query('archived')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Archived must be true or false'),
  
  query('search')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Search query too long')
];

/**
 * Validation rules for ID parameters
 */
const validateIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

/**
 * Middleware to handle validation results
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileSetup,
  validatePreferences,
  validateCreateSection,
  validateCreateBill,
  validateBillQuery,
  validateSectionQuery,
  validateIdParam,
  handleValidation
};