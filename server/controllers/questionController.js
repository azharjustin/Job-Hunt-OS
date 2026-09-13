import asyncHandler from 'express-async-handler';
import { Question } from '../models/Question.js';

export const getQuestions = asyncHandler(async (req, res) => {
  const questions = await Question.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(questions);
});

export const createQuestion = asyncHandler(async (req, res) => {
  const { applicationId, question, answer, category, prepared } = req.body;

  const newQuestion = new Question({
    user: req.user._id,
    applicationId,
    question,
    answer,
    category,
    prepared: prepared || false,
  });

  const created = await newQuestion.save();
  res.status(201).json(created);
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findOne({ _id: req.params.id, user: req.user._id });

  if (question) {
    Object.assign(question, req.body);
    const updated = await question.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Question not found');
  }
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findOne({ _id: req.params.id, user: req.user._id });

  if (question) {
    await question.deleteOne();
    res.json({ message: 'Question removed' });
  } else {
    res.status(404);
    throw new Error('Question not found');
  }
});
