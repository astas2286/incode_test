import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";

interface UserIdRequest extends Request {
  userId?: string;
}

// Register user
export const registerUser = async (req: UserIdRequest, res: Response) => {
  try {
    const { username, password, role, bossId } = req.body;

    let newBossId = ''

    const admin = await User.findOne({ role: "Administrator" });

    if (admin && role === "Administrator") {
      return res.status(400).json({ message: "Only one admin can be present" });
    }

    // Check if boss exists (for non-administrator users)
    if (role !== "Administrator") {
      let boss = await User.findById(bossId);

      if (boss?.role === "Regular") {
        return res
          .status(400)
          .json({ message: "Regular user can`t have subordinates" });
      }


      // if you trying to signup boss, his boss auomaticly change to admin
      if (boss?.role === "Boss") {
        newBossId = admin?.id;
      }

      if (!boss) {
        return res.status(400).json({ message: "Boss not found" });
      }
    }

    // Create user
    const user = new User({
      username,
      password: await bcrypt.hash(password, 10),
      role,
      boss: newBossId,
    });

    await user.save();

    // to hide password
    const userResponse = {
        ...user.toObject(),
        password: undefined,
      };

    res.status(201).json({ userResponse, message: "User registered successfully" });
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
  try {
    const { userId } = req.params;
    const { bossId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "Boss") {
      return res
        .status(403)
        .json({ message: "Only a boss can change the boss of a user" });
    }

    const subordinate = await User.findById(bossId);

    if (!subordinate || subordinate.boss.toString() !== userId) {
      return res.status(400).json({ message: "Invalid subordinate" });
    }

    subordinate.boss = user.boss;

    await subordinate.save();

    res.status(200).json({ message: "User boss changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
