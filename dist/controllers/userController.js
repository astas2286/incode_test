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
// Register user
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, role, bossId } = req.body;
        // Check if boss exists (for non-administrator users)
        if (role !== "Administrator") {
            const boss = yield User_1.default.findById(bossId);
            if (!boss) {
                return res.status(400).json({ message: "Boss not found" });
            }
        }
        // Create user
        const user = new User_1.default({
            username,
            password: yield bcrypt_1.default.hash(password, 10),
            role,
            boss: bossId,
        });
        yield user.save();
        res.status(201).json({ user, message: "User registered successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.registerUser = registerUser;
// Authenticate user
const authenticateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const y = 0;
    console.log('ddd');
    try {
        const { username, password } = req.body;
        const user = yield User_1.default.findOne({ username });
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
    try {
        const { userId } = req.params;
        const { bossId } = req.body;
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.role !== "Boss") {
            return res
                .status(403)
                .json({ message: "Only a boss can change the boss of a user" });
        }
        const subordinate = yield User_1.default.findById(bossId);
        if (!subordinate || subordinate.boss.toString() !== userId) {
            return res.status(400).json({ message: "Invalid subordinate" });
        }
        subordinate.boss = user.boss;
        yield subordinate.save();
        res.status(200).json({ message: "User boss changed successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.changeUserBoss = changeUserBoss;
