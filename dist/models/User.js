"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: [true, "Please enter users name"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [8, "A password must be at least 8 char long"],
        select: false,
    },
    role: {
        type: String,
        enum: ["Administrator", "Boss", "Regular"],
        required: true,
    },
    boss: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
});
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
