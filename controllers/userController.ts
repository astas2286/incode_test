import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import {updateUserRole} from "../utils/updateUser";

interface UserIdRequest extends Request {
  userId?: string;
}

// Register user
export const registerUser = async (req: UserIdRequest, res: Response) => {
  try {
    const { username, password, role, bossId } = req.body;

    let newBossId = "";
    const admin = await User.findOne({ role: "Administrator" });
    let boss = await User.findById(bossId);

    if (admin && role === "Administrator") {
      return res
        .status(400)
        .json({ message: "Only one admin can be presented" });
    }

    // Check if boss exists (for non-administrator users)
    if (role !== "Administrator") {
      if (!admin){
        return res
        .status(400)
        .json({ message: "Please add an Admin first" });
      }
      
      if (!boss && role !== "Boss") {
        return res.status(400).json({ message: "Boss not found" });
      }

      // If you add Regular1 to Regular2, then Regular2 became a Boss and subordinates to Administrator
      if (boss?.role === "Regular") {
        const updatedUser = await User.findByIdAndUpdate(
          boss._id,
          { role: "Boss", boss: admin?.id },
          { new: true }
        );

        if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
        }
      }
    }

    // Create user
    const user = new User({
      username,
      password: await bcrypt.hash(password, 10),
      role: role === "Boss" ? "Regular" : role,
      boss: role === "Administrator" ? null : (newBossId || bossId),
    });

    await user.save();

    // To hide password
    const userResponse = {
      ...user.toObject(),
      password: undefined,
    };

    res
      .status(201)
      .json({ userResponse, 
        message: "User registered successfully. You can't become a Boss right away, you need someone to attach a Regular to you." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Authenticate user
export const authenticateUser = async (req: UserIdRequest, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "");

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get list of users
export const getUsers = async (req: UserIdRequest, res: Response) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);

    let users;
    if (user?.role === "Administrator") {
      users = await User.find();
    } else if (user?.role === "Boss") {
      users = await User.find({
        $or: [{ boss: userId }, { _id: userId }],
      }).populate("boss");
    } else {
      users = await User.findById(userId);
    }

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Change user's boss
export const changeUserBoss = async (req: UserIdRequest, res: Response) => {
  const admin = await User.findOne({ role: "Administrator" });

  try {
    const { newBossId, regularId } = req.body;
    const { userId } = req;
    const oldBoss = await User.findById(userId);

    // Checking access rights to change the manager
    if (oldBoss?.role !== "Boss") {
      return res
        .status(403)
        .json({ success: false, message: "Please login as Boss" });
    }

    // Checking for a user with the specified regularId
    const regular = await User.findById(regularId);

    if (!regular) {
      return res
        .status(404)
        .json({ success: false, message: "Regular user not found" });
    }

    const isSubordinates = regular.boss.equals(oldBoss?._id);

    if (!isSubordinates) {
      return res
        .status(404)
        .json({ success: false, message: "This user does not belong to you" });
    }

    // Checking for a new boss with the specified newBossId
    const newBoss = await User.findById(newBossId);
    if (!newBoss) {
      return res
        .status(404)
        .json({ success: false, message: "No new Boss has been found" });
    }

    // Update the user's bossId field & saving regular
    regular.boss = newBossId;
    await regular.save();
    
    const regularOldCount = (await User.find({ boss: userId })).length;
    updateUserRole(regularOldCount, userId, newBossId, admin?._id)
    
    const regularNewCount = (await User.find({ boss: newBossId })).length;
    updateUserRole(regularNewCount, newBossId, userId, admin?._id)

    res.status(200).json({
      regular,
      success: true,
      message: "The Boss has been successfully replaced",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
