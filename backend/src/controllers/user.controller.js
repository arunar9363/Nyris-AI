const User = require('../models/User.model');
const Resume = require('../models/Resume.model');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const resumeCount = await Resume.countDocuments({ userId: req.user._id });
    const favoriteCount = await Resume.countDocuments({ userId: req.user._id, isFavorite: true });
    res.json({ success: true, data: { user, resumeCount, favoriteCount } });
  } catch (error) { next(error); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, branch } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, branch },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

exports.getFavorites = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id, isFavorite: true })
      .select('-optimizedHtml -originalResumeText')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: resumes });
  } catch (error) { next(error); }
};
