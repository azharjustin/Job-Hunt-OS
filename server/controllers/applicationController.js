import asyncHandler from 'express-async-handler';
import { Application } from '../models/Application.js';

// @desc    Get all user applications
// @route   GET /api/applications
// @access  Private
export const getApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(applications);
});

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
export const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findOne({ _id: req.params.id, user: req.user._id });

  if (application) {
    res.json(application);
  } else {
    res.status(404);
    throw new Error('Application not found');
  }
});

// @desc    Create new application
// @route   POST /api/applications
// @access  Private
export const createApplication = asyncHandler(async (req, res) => {
  const {
    companyId,
    jobTitle,
    jobUrl,
    status,
    priority,
    location,
    workMode,
    employmentType,
    salaryMin,
    salaryMax,
    salaryCurrency,
    applicationDeadline,
    appliedAt,
    resumeId,
    notes,
    jobDescription,
  } = req.body;

  const application = new Application({
    user: req.user._id,
    companyId: companyId || '',
    jobTitle,
    jobUrl,
    status,
    priority,
    location,
    workMode,
    employmentType,
    salaryMin,
    salaryMax,
    salaryCurrency,
    applicationDeadline,
    appliedAt,
    resumeId,
    notes,
    jobDescription,
  });

  const createdApp = await application.save();
  res.status(201).json(createdApp);
});

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
export const updateApplication = asyncHandler(async (req, res) => {
  const application = await Application.findOne({ _id: req.params.id, user: req.user._id });

  if (application) {
    Object.assign(application, req.body);
    const updatedApp = await application.save();
    res.json(updatedApp);
  } else {
    res.status(404);
    throw new Error('Application not found');
  }
});

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
export const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findOne({ _id: req.params.id, user: req.user._id });

  if (application) {
    await application.deleteOne();
    res.json({ message: 'Application removed' });
  } else {
    res.status(404);
    throw new Error('Application not found');
  }
});

// @desc    Bulk sync / seed applications
// @route   POST /api/applications/seed
// @access  Private
export const seedApplications = asyncHandler(async (req, res) => {
  const { applications } = req.body;
  if (!Array.isArray(applications)) {
    res.status(400);
    throw new Error('Invalid applications array');
  }

  // Remove existing or update
  for (const app of applications) {
    const { id, ...appData } = app;
    await Application.create({
      ...appData,
      user: req.user._id,
    });
  }

  const all = await Application.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(201).json(all);
});
