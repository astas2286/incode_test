import mongoose, { Document } from "mongoose";

interface User extends Document {
  username: string;
  password: string;
  role: "Administrator" | "Boss" | "Regular";
  boss: mongoose.Types.ObjectId;
}

const userSchema = new mongoose.Schema<User>({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const User = mongoose.model<User>("User", userSchema);

export default User;
