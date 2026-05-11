import { Announcement } from "../models/Announcement.js";
import { ROLES } from "../constants/roles.js";
import { ApiError } from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";

const populateAuthor = (query) =>
  query.populate("createdBy", "name email role department");

export const getActiveAnnouncements = catchAsync(async (_req, res) => {
  const announcements = await populateAuthor(
    Announcement.find({ isActive: true }).sort({ createdAt: -1 }).limit(12)
  );
  res.json(announcements);
});

export const getManagedAnnouncements = catchAsync(async (_req, res) => {
  const announcements = await populateAuthor(
    Announcement.find().sort({ createdAt: -1 }).limit(100)
  );
  res.json(announcements);
});

export const createAnnouncement = catchAsync(async (req, res) => {
  const announcement = await Announcement.create({
    title: req.body.title,
    message: req.body.message,
    priority: req.body.priority || "normal",
    isActive: req.body.isActive ?? true,
    createdBy: req.user._id,
  });

  const populated = await populateAuthor(Announcement.findById(announcement._id));
  res.status(201).json(populated);
});

export const updateAnnouncement = catchAsync(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    throw new ApiError(404, "Announcement not found.");
  }

  if (
    req.user.role !== ROLES.ADMIN &&
    String(announcement.createdBy) !== String(req.user._id)
  ) {
    throw new ApiError(403, "You can only edit announcements created by you.");
  }

  announcement.title = req.body.title ?? announcement.title;
  announcement.message = req.body.message ?? announcement.message;
  announcement.priority = req.body.priority ?? announcement.priority;
  announcement.isActive = req.body.isActive ?? announcement.isActive;
  await announcement.save();

  const populated = await populateAuthor(Announcement.findById(announcement._id));
  res.json(populated);
});

export const deleteAnnouncement = catchAsync(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    throw new ApiError(404, "Announcement not found.");
  }

  if (
    req.user.role !== ROLES.ADMIN &&
    String(announcement.createdBy) !== String(req.user._id)
  ) {
    throw new ApiError(403, "You can only delete announcements created by you.");
  }

  await announcement.deleteOne();
  res.status(204).send();
});
