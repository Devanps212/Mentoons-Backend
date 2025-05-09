const Job = require("../models/jobs");
const JobApplication = require("../models/jobApplication");
const messageHelper = require("../utils/messageHelper");
const mongoose = require("mongoose");

const addJob = async (
  jobTitle,
  jobDescription,
  skillsRequired,
  location,
  jobType,
  thumbnail
) => {
  try {
    const job = await Job.create({
      jobTitle,
      jobDescription,
      skillsRequired,
      location,
      jobType,
      thumbnail,
    });
    return job;
  } catch (error) {
    throw error;
  }
};
const getJobs = async (page = 1, limit = 10, search = "") => {
  try {
    const skip = (page - 1) * Number(limit);
    const searchRegex = new RegExp(search, "i");

    const jobs = await Job.aggregate([
      {
        $match: {
          $or: [
            { jobTitle: { $regex: searchRegex } },
            { jobDescription: { $regex: searchRegex } },
            { skillsRequired: { $in: [searchRegex] } },
            { location: { $regex: searchRegex } },
          ],
        },
      },
      {
        $project: {
          jobTitle: 1,
          jobDescription: 1,
          skillsRequired: 1,
          location: 1,
          jobType: 1,
          thumbnail: 1,
          applicationCount: { $size: "$applications" },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]);

    const totalJobs = await Job.countDocuments({
      $or: [
        { jobTitle: { $regex: searchRegex } },
        { jobDescription: { $regex: searchRegex } },
        { skillsRequired: { $in: [searchRegex] } },
        { location: { $regex: searchRegex } },
      ],
    });

    return {
      jobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs,
    };
  } catch (error) {
    throw error;
  }
};

const getJobById = async (id) => {
  try {
    const job = await Job.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "jobapplications",
          localField: "applications",
          foreignField: "_id",
          as: "applicationDetails",
        },
      },
      {
        $project: {
          jobTitle: 1,
          jobDescription: 1,
          skillsRequired: 1,
          location: 1,
          jobType: 1,
          thumbnail: 1,
          applicationCount: { $size: "$applications" },
          applicationDetails: 1,
        },
      },
    ]);

    return job[0];
  } catch (error) {
    throw error;
  }
};

const editJob = async (
  id,
  jobTitle,
  jobDescription,
  skillsRequired,
  location,
  jobType,
  thumbnail
) => {
  try {
    const jobListing = await Job.findById(id);
    if (!jobListing) {
      throw new Error(messageHelper.JOB_NOT_FOUND);
    }
    const job = await Job.findByIdAndUpdate(id, {
      jobTitle,
      jobDescription,
      skillsRequired,
      location,
      jobType,
      thumbnail,
    });
    return job;
  } catch (error) {
    throw error;
  }
};
const deleteJob = async (id) => {
  try {
    const jobListing = await Job.findById(id);
    if (!jobListing) {
      throw new Error(messageHelper.JOB_NOT_FOUND);
    }
    const job = await Job.findByIdAndDelete(id);
    return job;
  } catch (error) {
    throw error;
  }
};

const applyJob = async (
  jobId,
  name,
  email,
  phone,
  gender,
  portfolioLink,
  coverNote,
  resume
) => {
  try {
    const jobListing = await Job.findById(jobId);
    if (!jobListing) {
      throw new Error(messageHelper.JOB_NOT_FOUND);
    }

    const application = await JobApplication.create({
      jobId,
      name,
      email,
      phone,
      gender,
      portfolioLink,
      coverNote,
      resume,
    });
    jobListing.applications.push(application._id);
    await jobListing.save();

    return application;
  } catch (error) {
    throw error;
  }
};

const getAppliedJobs = async (
  search,
  page = 1,
  limit = 10,
  sortOrder = -1,
  sortField = "createdAt"
) => {
  try {
    const validPage = Math.max(1, parseInt(page) || 1);
    const validLimit = Math.max(1, parseInt(limit) || 10);
    const skip = (validPage - 1) * validLimit;

    const searchRegex = new RegExp(search, "i");

    const matchStage = {
      $or: [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { "jobDetails.jobTitle": { $regex: searchRegex } },
        { "jobDetails.jobDescription": { $regex: searchRegex } },
        { "jobDetails.company": { $regex: searchRegex } },
      ],
    };

    const jobs = await JobApplication.aggregate([
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "jobDetails",
        },
      },
      {
        $unwind: "$jobDetails",
      },
      {
        $match: matchStage,
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          gender: 1,
          portfolioLink: 1,
          coverNote: 1,
          resume: 1,
          jobTitle: "$jobDetails.jobTitle",
          createdAt: 1,
        },
      },
      { $sort: { createdAt: sortOrder } },
      { $skip: skip },
      { $limit: validLimit },
    ]);

    const totalJobs = await JobApplication.aggregate([
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "jobDetails",
        },
      },
      {
        $unwind: "$jobDetails",
      },
      {
        $match: matchStage,
      },
      { $count: "total" },
    ]);

    const totalCount = totalJobs.length > 0 ? totalJobs[0].total : 0;

    return {
      jobs,
      currentPage: validPage,
      totalPages: Math.ceil(totalCount / validLimit),
      totalJobs: totalCount,
    };
  } catch (error) {
    throw error;
  }
};

const getAppliedJobById = async (id) => {
  try {
    const jobApplication = await JobApplication.findById(id);
    return jobApplication;
  } catch (error) {
    throw error;
  }
};
module.exports = {
  addJob,
  getJobs,
  getJobById,
  applyJob,
  editJob,
  deleteJob,
  getAppliedJobs,
  getAppliedJobById,
};
