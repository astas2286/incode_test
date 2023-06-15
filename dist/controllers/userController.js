"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeUserBoss = exports.getUsers = exports.authenticateUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const updateUser_1 = require("../utils/updateUser");
// Register user
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, role, bossId } = req.body;
        let newBossId = "";
        const admin = yield User_1.default.findOne({ role: "Administrator" });
        let boss = yield User_1.default.findById(bossId);
        if (admin && role === "Administrator") {
            return res
                .status(400)
                .json({ message: "Only one admin can be presented" });
        }
        // Check if boss exists (for non-administrator users)
        if (role !== "Administrator") {
            if (!admin) {
                return res
                    .status(400)
                    .json({ message: "Please add an Admin first" });
            }
            if (!boss && role !== "Boss") {
                return res.status(400).json({ message: "Boss not found" });
            }
            // If you add Regular1 to Regular2, then Regular2 became a Boss and subordinates to Administrator
            if ((boss === null || boss === void 0 ? void 0 : boss.role) === "Regular") {
                const updatedUser = yield User_1.default.findByIdAndUpdate(boss._id, { role: "Boss", boss: admin === null || admin === void 0 ? void 0 : admin.id }, { new: true });
                if (!updatedUser) {
                    return res.status(404).json({ message: "User not found" });
                }
            }
        }
        // Create user
        const user = new User_1.default({
            username,
            password: yield bcrypt_1.default.hash(password, 10),
            role: role === "Boss" ? "Regular" : role,
            boss: role === "Administrator" ? null : (newBossId || bossId),
        });
        yield user.save();
        // To hide password
        const userResponse = Object.assign(Object.assign({}, user.toObject()), { password: undefined });
        res
            .status(201)
            .json({ userResponse,
            message: "User registered successfully. You can't become a Boss right away, you need someone to attach a Regular to you, so you are starting as a Regular" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.registerUser = registerUser;
// Authenticate user
const authenticateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield User_1.default.findOne({ username }).select("+password");
        if (!user) {
            return res.status(401).json({ message: "Authentication failed" });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Authentication failed" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET || "");
        res.status(200).json({ token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.authenticateUser = authenticateUser;
// Get list of users
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const user = yield User_1.default.findById(userId);
        let users;
        if ((user === null || user === void 0 ? void 0 : user.role) === "Administrator") {
            users = yield User_1.default.find();
        }
        else if ((user === null || user === void 0 ? void 0 : user.role) === "Boss") {
            users = yield User_1.default.find({
                $or: [{ boss: userId }, { _id: userId }],
            }).populate("boss");
        }
        else {
            users = yield User_1.default.findById(userId);
        }
        res.status(200).json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getUsers = getUsers;
// Change user's boss
const changeUserBoss = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield User_1.default.findOne({ role: "Administrator" });
    try {
        const { newBossId, regularId } = req.body;
        const { userId } = req;
        const oldBoss = yield User_1.default.findById(userId);
        // Checking access rights to change the manager
        if ((oldBoss === null || oldBoss === void 0 ? void 0 : oldBoss.role) !== "Boss") {
            return res
                .status(403)
                .json({ success: false, message: "Please login as Boss" });
        }
        // Checking for a user with the specified regularId
        const regular = yield User_1.default.findById(regularId);
        if (!regular) {
            return res
                .status(404)
                .json({ success: false, message: "Regular user not found" });
        }
        const isSubordinates = regular.boss.equals(oldBoss === null || oldBoss === void 0 ? void 0 : oldBoss._id);
        if (!isSubordinates) {
            return res
                .status(404)
                .json({ success: false, message: "This user does not belong to you" });
        }
        // Checking for a new boss with the specified newBossId
        const newBoss = yield User_1.default.findById(newBossId);
        if (!newBoss) {
            return res
                .status(404)
                .json({ success: false, message: "No new Boss has been found" });
        }
        // Update the user's bossId field & saving regular
        regular.boss = newBossId;
        yield regular.save();
        const regularOldCount = (yield User_1.default.find({ boss: userId })).length;
        (0, updateUser_1.updateUserRole)(regularOldCount, userId, newBossId, admin === null || admin === void 0 ? void 0 : admin._id);
        const regularNewCount = (yield User_1.default.find({ boss: newBossId })).length;
        (0, updateUser_1.updateUserRole)(regularNewCount, newBossId, userId, admin === null || admin === void 0 ? void 0 : admin._id);
        res.status(200).json({
            regular,
            success: true,
            message: "The Boss has been successfully replaced",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
exports.changeUserBoss = changeUserBoss;
