"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/register', userController_1.registerUser);
router.post('/authenticate', userController_1.authenticateUser);
router.get('/users', authMiddleware_1.protect, userController_1.getUsers);
router.patch('/users/:userId/change-boss', authMiddleware_1.protect, userController_1.changeUserBoss);
exports.default = router;