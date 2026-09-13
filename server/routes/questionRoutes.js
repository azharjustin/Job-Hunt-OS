import express from 'express';
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/questionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getQuestions)
  .post(createQuestion);

router.route('/:id')
  .put(updateQuestion)
  .delete(deleteQuestion);

export default router;
