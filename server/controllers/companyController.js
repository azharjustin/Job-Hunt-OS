import asyncHandler from 'express-async-handler';
import { Company } from '../models/Company.js';

export const getCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(companies);
});

export const getCompanyById = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ _id: req.params.id, user: req.user._id });
  if (company) {
    res.json(company);
  } else {
    res.status(404);
    throw new Error('Company not found');
  }
});

export const createCompany = asyncHandler(async (req, res) => {
  const { name, website, industry, location, size, notes, contacts } = req.body;

  const company = new Company({
    user: req.user._id,
    name,
    website,
    industry,
    location,
    size,
    notes,
    contacts: contacts || [],
  });

  const createdCompany = await company.save();
  res.status(201).json(createdCompany);
});

export const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ _id: req.params.id, user: req.user._id });

  if (company) {
    Object.assign(company, req.body);
    const updatedCompany = await company.save();
    res.json(updatedCompany);
  } else {
    res.status(404);
    throw new Error('Company not found');
  }
});

export const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ _id: req.params.id, user: req.user._id });

  if (company) {
    await company.deleteOne();
    res.json({ message: 'Company removed' });
  } else {
    res.status(404);
    throw new Error('Company not found');
  }
});
