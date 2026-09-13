import asyncHandler from 'express-async-handler';
import { Resume } from '../models/Resume.js';

export const getResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(resumes);
});

export const createResume = asyncHandler(async (req, res) => {
  const { name, role, version, fileUrl, skills, notes } = req.body;

  const resume = new Resume({
    user: req.user._id,
    name,
    role,
    version,
    fileUrl,
    skills,
    notes,
  });

  const createdResume = await resume.save();
  res.status(201).json(createdResume);
});

export const updateResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

  if (resume) {
    Object.assign(resume, req.body);
    const updated = await resume.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Resume not found');
  }
});

export const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

  if (resume) {
    await resume.deleteOne();
    res.json({ message: 'Resume removed' });
  } else {
    res.status(404);
    throw new Error('Resume not found');
  }
});
