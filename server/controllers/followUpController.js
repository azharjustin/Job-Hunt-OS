import asyncHandler from 'express-async-handler';
import { FollowUp } from '../models/FollowUp.js';

export const getFollowUps = asyncHandler(async (req, res) => {
  const followUps = await FollowUp.find({ user: req.user._id }).sort({ dueDate: 1 });
  res.json(followUps);
});

export const createFollowUp = asyncHandler(async (req, res) => {
  const { applicationId, title, dueDate, type, completed, notes } = req.body;

  const followUp = new FollowUp({
    user: req.user._id,
    applicationId,
    title,
    dueDate,
    type,
    completed: completed || false,
    notes,
  });

  const created = await followUp.save();
  res.status(201).json(created);
});

export const updateFollowUp = asyncHandler(async (req, res) => {
  const followUp = await FollowUp.findOne({ _id: req.params.id, user: req.user._id });

  if (followUp) {
    Object.assign(followUp, req.body);
    const updated = await followUp.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error('FollowUp not found');
  }
});

export const deleteFollowUp = asyncHandler(async (req, res) => {
  const followUp = await FollowUp.findOne({ _id: req.params.id, user: req.user._id });

  if (followUp) {
    await followUp.deleteOne();
    res.json({ message: 'FollowUp removed' });
  } else {
    res.status(404);
    throw new Error('FollowUp not found');
  }
});
