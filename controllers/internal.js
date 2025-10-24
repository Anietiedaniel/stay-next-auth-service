import User from "../models/User.js";

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    console.log("Fetched user:", user);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
};


export const getUsersBatch = async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: "ids required and must be an array" });
  }

  try {
    const users = await User.find({ _id: { $in: ids } }).lean();
    res.status(200).json({ users });
  } catch (err) {
    console.error("getUsersBatch error:", err);
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};