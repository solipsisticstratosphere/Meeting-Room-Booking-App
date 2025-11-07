import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
};

export const validateEmail = () =>
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email');

export const validatePassword = (minLength: number = 6) =>
  body('password')
    .isLength({ min: minLength })
    .withMessage(`Password must be at least ${minLength} characters`);

export const validateName = () =>
  body('name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters');

export const validateRoomName = () =>
  body('name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Room name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Room name must be 3-100 characters');

export const validateRoomDescription = () =>
  body('description')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 500 })
    .withMessage('Description max length is 500 characters');

export const validateBookingTime = () => [
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be a valid date'),
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .isISO8601()
    .withMessage('End time must be a valid date')
    .custom((endTime, { req }) => {
      const start = new Date(req.body.startTime);
      const end = new Date(endTime);
      if (end <= start) {
        throw new Error('End time must be after start time');
      }
      return true;
    })
];

export const validateBookingDescription = () =>
  body('description')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 1000 })
    .withMessage('Description max length is 1000 characters');

export const validateRoomId = () =>
  body('meetingRoomId')
    .notEmpty()
    .withMessage('Meeting room ID is required')
    .isUUID()
    .withMessage('Invalid meeting room ID format');

export const validateUserId = () =>
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('Invalid user ID format');

export const validateRole = () =>
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['ADMIN', 'USER'])
    .withMessage('Invalid role value. Must be ADMIN or USER');

export const validateUserEmail = () =>
  body('userEmail')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid user email');

export const registerValidation = [
  validateName(),
  validateEmail(),
  validatePassword(6),
  handleValidationErrors
];

export const loginValidation = [
  validateEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const createRoomValidation = [
  validateRoomName(),
  validateRoomDescription(),
  handleValidationErrors
];

export const updateRoomValidation = [
  validateRoomName().optional(),
  validateRoomDescription(),
  handleValidationErrors
];

export const createBookingValidation = [
  validateRoomId(),
  ...validateBookingTime(),
  validateBookingDescription(),
  handleValidationErrors
];

export const updateBookingValidation = [
  ...validateBookingTime().map(v => v.optional()),
  validateBookingDescription(),
  handleValidationErrors
];

export const addRoomUserValidation = [
  validateUserEmail(),
  validateRole(),
  handleValidationErrors
];
