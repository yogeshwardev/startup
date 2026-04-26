import { User } from "../models/User.js";
import { Submission } from "../models/Submission.js";
import { PracticeSession } from "../models/PracticeSession.js";
import { ProfileMessage } from "../models/ProfileMessage.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ApiError } from "../utils/ApiError.js";

const canSeeMalpractice = (role) => role === "ADMIN" || role === "TEACHER";

const getProfileDisplayName = (user) => {
  const localPart = user.email?.split("@")[0] || user.name || "user";
  return localPart.replace(/[._-]+/g, " ").trim() || localPart;
};

const buildStreak = (dates) => {
  const uniqueDays = [...new Set(dates.map((value) => value.toISOString().slice(0, 10)))].sort();
  let currentStreak = 0;
  let maxStreak = 0;
  let previous = null;
  const today = new Date().toISOString().slice(0, 10);

  uniqueDays.forEach((day) => {
    if (!previous) {
      currentStreak = 1;
      maxStreak = 1;
      previous = day;
      return;
    }

    const difference =
      (new Date(day).getTime() - new Date(previous).getTime()) / 86_400_000;
    currentStreak = difference === 1 ? currentStreak + 1 : 1;
    maxStreak = Math.max(maxStreak, currentStreak);
    previous = day;
  });

  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const activeCurrentStreak = uniqueDays.length
    ? uniqueDays[uniqueDays.length - 1] === today || uniqueDays[uniqueDays.length - 1] === yesterday
      ? currentStreak
      : 0
    : 0;

  return {
    current: activeCurrentStreak,
    max: maxStreak,
    activeDays: uniqueDays.length,
  };
};

const buildActivityCalendar = (dates) => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 364);
  start.setHours(0, 0, 0, 0);

  const countsByDay = dates.reduce((accumulator, value) => {
    const key = value.toISOString().slice(0, 10);
    accumulator.set(key, (accumulator.get(key) || 0) + 1);
    return accumulator;
  }, new Map());

  const days = [];
  const cursor = new Date(start);

  while (cursor <= today) {
    const key = cursor.toISOString().slice(0, 10);
    days.push({
      date: key,
      count: countsByDay.get(key) || 0,
      month: cursor.toLocaleString("en-US", { month: "short" }),
      weekday: cursor.getDay(),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
};

const buildBadges = (solvedCount, streak) => {
  const badges = [
    {
      key: "first-blood",
      label: "First AC",
      earned: solvedCount >= 1,
    },
    {
      key: "century",
      label: "Century Solver",
      earned: solvedCount >= 100,
    },
    {
      key: "streak-7",
      label: "7 Day Streak",
      earned: streak.max >= 7,
    },
  ];

  return {
    earned: badges.filter((badge) => badge.earned),
    locked: badges.filter((badge) => !badge.earned),
  };
};

const buildProfilePayload = async (viewer, profileUser) => {
  const [acceptedSubmissions, malpracticeSessions, allSubmissions] = await Promise.all([
    Submission.find({
      userId: profileUser._id,
      status: "Accepted",
      contestId: null,
    })
      .populate("problemId", "title slug difficulty problemCode")
      .sort({ createdAt: -1 })
      .lean(),
    PracticeSession.find({
      userId: profileUser._id,
      malpractice: true,
    })
      .populate("problemId", "title slug difficulty problemCode")
      .sort({ createdAt: -1 })
      .lean(),
    Submission.find({
      userId: profileUser._id,
      contestId: null,
    })
      .populate("problemId", "title slug difficulty problemCode")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const solvedMap = new Map();
  acceptedSubmissions.forEach((submission) => {
    if (!submission.problemId) {
      return;
    }

    const key = String(submission.problemId._id);
    if (!solvedMap.has(key)) {
      solvedMap.set(key, {
        problemId: submission.problemId._id,
        title: submission.problemId.title,
        slug: submission.problemId.slug,
        difficulty: submission.problemId.difficulty,
        problemCode: submission.problemId.problemCode,
        solvedAt: submission.createdAt,
      });
    }
  });

  const solvedProblems = [...solvedMap.values()].sort(
    (left, right) => new Date(right.solvedAt).getTime() - new Date(left.solvedAt).getTime()
  );

  const followerUsers = await User.find({
    _id: { $in: profileUser.followers || [] },
  })
    .select("email")
    .lean();

  const followingUsers = await User.find({
    _id: { $in: profileUser.following || [] },
  })
    .select("email")
    .lean();

  const streak = buildStreak(acceptedSubmissions.map((entry) => new Date(entry.createdAt)));
  const solvedByDifficulty = solvedProblems.reduce(
    (accumulator, entry) => {
      const key = entry.difficulty?.toLowerCase();
      if (key && accumulator[key] !== undefined) {
        accumulator[key] += 1;
      }
      return accumulator;
    },
    { easy: 0, medium: 0, hard: 0 }
  );
  const activityCalendar = buildActivityCalendar(
    acceptedSubmissions.map((entry) => new Date(entry.createdAt))
  );
  const totalSolved = solvedProblems.length;
  const rankedUsers = await Submission.aggregate([
    { $match: { status: "Accepted", contestId: null } },
    {
      $group: {
        _id: { userId: "$userId", problemId: "$problemId" },
      },
    },
    {
      $group: {
        _id: "$_id.userId",
        solvedCount: { $sum: 1 },
      },
    },
    { $sort: { solvedCount: -1, _id: 1 } },
  ]);
  const rank =
    rankedUsers.findIndex(
      (entry) => String(entry._id) === String(profileUser._id)
    ) + 1 || null;
  const languageStats = acceptedSubmissions.reduce((accumulator, entry) => {
    const current = accumulator[entry.language] || { solved: 0 };
    accumulator[entry.language] = { solved: current.solved + 1 };
    return accumulator;
  }, {});
  const communityStats = {
    views: totalSolved * 12 + (profileUser.followers?.length || 0) * 8,
    solutions: totalSolved,
    discussions: allSubmissions.length,
    reputation: totalSolved * 15 + (profileUser.followers?.length || 0) * 5,
  };
  const badges = buildBadges(totalSolved, streak);
  const recentActivity = acceptedSubmissions.slice(0, 10).map((entry) => ({
    id: entry._id,
    title: entry.problemId?.title || "Problem",
    slug: entry.problemId?.slug || "",
    difficulty: entry.problemId?.difficulty || entry.difficulty,
    createdAt: entry.createdAt,
    language: entry.language,
  }));

  return {
    user: {
      id: profileUser._id,
      userCode: profileUser.userCode,
      displayName: getProfileDisplayName(profileUser),
      username: profileUser.email.split("@")[0],
      email: profileUser.email,
      department: profileUser.department,
      year: profileUser.year,
      role: profileUser.role,
      rank,
      registrationNumber: profileUser.registrationNumber,
      bio: profileUser.profile?.bio || "",
      skills: profileUser.profile?.skills || [],
      socialLinks: profileUser.profile?.socialLinks || {},
      followersCount: profileUser.followers?.length || 0,
      followingCount: profileUser.following?.length || 0,
      isFollowing: (viewer.following || []).some(
        (entry) => String(entry) === String(profileUser._id)
      ),
      followers: followerUsers.map((entry) => ({
        id: entry._id,
        displayName: getProfileDisplayName(entry),
        username: entry.email.split("@")[0],
      })),
      following: followingUsers.map((entry) => ({
        id: entry._id,
        displayName: getProfileDisplayName(entry),
        username: entry.email.split("@")[0],
      })),
    },
    stats: {
      streak,
      solvedCount: totalSolved,
      solvedProblems,
      solvedByDifficulty,
      activityCalendar,
      communityStats,
      languageStats,
      recentActivity,
      badges,
    },
    malpractice: canSeeMalpractice(viewer.role)
      ? malpracticeSessions
          .filter((session) => session.problemId)
          .map((session) => ({
            id: session._id,
            title: session.problemId.title,
            slug: session.problemId.slug,
            difficulty: session.problemId.difficulty,
            problemCode: session.problemId.problemCode,
            reason: session.terminationReason,
            createdAt: session.createdAt,
          }))
      : [],
  };
};

export const getMyProfile = catchAsync(async (req, res) => {
  const viewer = await User.findById(req.user._id).select(
    "email department year role registrationNumber followers following profile"
  );
  const payload = await buildProfilePayload(viewer, viewer);
  res.json(payload);
});

export const searchProfiles = catchAsync(async (req, res) => {
  const query = req.query.query?.trim();

  if (!query) {
    return res.json([]);
  }

  const users = await User.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
      { registrationNumber: { $regex: query, $options: "i" } },
    ],
  })
    .select("email registrationNumber department year")
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  res.json(
    users.map((entry) => ({
      id: entry._id,
      displayName: getProfileDisplayName(entry),
      username: entry.email.split("@")[0],
      email: entry.email,
      registrationNumber: entry.registrationNumber,
      department: entry.department,
      year: entry.year,
    }))
  );
});

export const getUserProfile = catchAsync(async (req, res) => {
  const [viewer, profileUser] = await Promise.all([
    User.findById(req.user._id).select(
      "email department year role registrationNumber userCode followers following profile"
    ),
    User.findById(req.params.id).select(
      "email department year role registrationNumber userCode followers following profile"
    ),
  ]);

  if (!profileUser) {
    throw new ApiError(404, "User not found.");
  }

  const payload = await buildProfilePayload(viewer, profileUser);
  res.json(payload);
});

export const getProfileConnections = catchAsync(async (req, res) => {
  const profileUser = await User.findById(req.params.id).select(
    "email followers following"
  );

  if (!profileUser) {
    throw new ApiError(404, "User not found.");
  }

  const [followers, following] = await Promise.all([
    User.find({
      _id: { $in: profileUser.followers || [] },
    })
      .select("email department year registrationNumber")
      .sort({ email: 1 })
      .lean(),
    User.find({
      _id: { $in: profileUser.following || [] },
    })
      .select("email department year registrationNumber")
      .sort({ email: 1 })
      .lean(),
  ]);

  const formatConnection = (entry) => ({
    id: entry._id,
    displayName: getProfileDisplayName(entry),
    username: entry.email.split("@")[0],
    email: entry.email,
    department: entry.department,
    year: entry.year,
    registrationNumber: entry.registrationNumber,
  });

  res.json({
    user: {
      id: profileUser._id,
      displayName: getProfileDisplayName(profileUser),
      username: profileUser.email.split("@")[0],
    },
    followers: followers.map(formatConnection),
    following: following.map(formatConnection),
  });
});

export const toggleFollowUser = catchAsync(async (req, res) => {
  if (String(req.user._id) === req.params.id) {
    throw new ApiError(400, "You cannot follow yourself.");
  }

  const [viewer, target] = await Promise.all([
    User.findById(req.user._id).select("following"),
    User.findById(req.params.id).select("followers"),
  ]);

  if (!target) {
    throw new ApiError(404, "User not found.");
  }

  const isFollowing = (viewer.following || []).some(
    (entry) => String(entry) === String(target._id)
  );

  if (isFollowing) {
    viewer.following = (viewer.following || []).filter(
      (entry) => String(entry) !== String(target._id)
    );
    target.followers = (target.followers || []).filter(
      (entry) => String(entry) !== String(viewer._id)
    );
  } else {
    viewer.following = [...(viewer.following || []), target._id];
    target.followers = [...(target.followers || []), viewer._id];
  }

  await Promise.all([viewer.save(), target.save()]);

  res.json({
    following: !isFollowing,
    followersCount: target.followers.length,
    followingCount: viewer.following.length,
  });
});

export const updateMySkills = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select("profile email");

  user.profile = {
    ...(user.profile?.toObject ? user.profile.toObject() : user.profile || {}),
    skills: req.body.skills,
  };

  await user.save();

  res.json({
    skills: user.profile.skills,
    displayName: getProfileDisplayName(user),
  });
});

export const updateMySocialLinks = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select("profile email");

  user.profile = {
    ...(user.profile?.toObject ? user.profile.toObject() : user.profile || {}),
    socialLinks: req.body.socialLinks,
  };

  await user.save();

  res.json({
    socialLinks: user.profile.socialLinks,
    displayName: getProfileDisplayName(user),
  });
});

export const updateMyBio = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select("profile email");

  user.profile = {
    ...(user.profile?.toObject ? user.profile.toObject() : user.profile || {}),
    bio: req.body.bio,
  };

  await user.save();

  res.json({
    bio: user.profile.bio,
    displayName: getProfileDisplayName(user),
  });
});

const ensureChatAccess = async (viewerId, targetId) => {
  const [viewer, target] = await Promise.all([
    User.findById(viewerId).select("followers following role"),
    User.findById(targetId).select("followers following"),
  ]);

  if (!target) {
    throw new ApiError(404, "User not found.");
  }

  const hasRelation =
    viewer.role === "ADMIN" ||
    (viewer.following || []).some((entry) => String(entry) === String(targetId)) ||
    (viewer.followers || []).some((entry) => String(entry) === String(targetId)) ||
    (target.following || []).some((entry) => String(entry) === String(viewerId)) ||
    (target.followers || []).some((entry) => String(entry) === String(viewerId));

  if (!hasRelation) {
    throw new ApiError(403, "Chat is available only with followers or followed users.");
  }

  return { viewer, target };
};

export const getProfileChat = catchAsync(async (req, res) => {
  await ensureChatAccess(req.user._id, req.params.id);

  const messages = await ProfileMessage.find({
    $or: [
      { senderId: req.user._id, receiverId: req.params.id },
      { senderId: req.params.id, receiverId: req.user._id },
    ],
  })
    .populate("senderId", "email")
    .sort({ createdAt: 1 })
    .lean();

  res.json(
    messages.map((message) => ({
      id: message._id,
      senderId: message.senderId._id,
      senderName: getProfileDisplayName(message.senderId),
      message: message.message,
      createdAt: message.createdAt,
    }))
  );
});

export const sendProfileChatMessage = catchAsync(async (req, res) => {
  await ensureChatAccess(req.user._id, req.params.id);

  const message = await ProfileMessage.create({
    senderId: req.user._id,
    receiverId: req.params.id,
    message: req.body.message,
  });

  const populated = await ProfileMessage.findById(message._id)
    .populate("senderId", "email")
    .lean();

  res.status(201).json({
    id: populated._id,
    senderId: populated.senderId._id,
    senderName: getProfileDisplayName(populated.senderId),
    message: populated.message,
    createdAt: populated.createdAt,
  });
});
