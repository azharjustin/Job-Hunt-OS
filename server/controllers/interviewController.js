import asyncHandler from 'express-async-handler';
import { Interview } from '../models/Interview.js';

export const getInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ user: req.user._id }).sort({ dateTime: 1 });
  res.json(interviews);
});

export const createInterview = asyncHandler(async (req, res) => {
  const { applicationId, type, dateTime, duration, interviewer, meetingUrl, status, notes, feedback } = req.body;

  const interview = new Interview({
    user: req.user._id,
    applicationId,
    type,
    dateTime,
    duration,
    interviewer,
    meetingUrl,
    status,
    notes,
    feedback,
  });

  const createdInterview = await interview.save();
  res.status(201).json(createdInterview);
});

export const updateInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });

  if (interview) {
    Object.assign(interview, req.body);
    const updated = await interview.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Interview not found');
  }
});

export const deleteInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });

  if (interview) {
    await interview.deleteOne();
    res.json({ message: 'Interview removed' });
  } else {
    res.status(404);
    throw new Error('Interview not found');
  }
});
