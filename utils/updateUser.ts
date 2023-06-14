import User from "../models/User";
import { ObjectId } from "mongodb";

export const updateUserRole = async (
  count: number,
  id: ObjectId | string | undefined,
  newBossId: ObjectId | string | undefined,
  admin: ObjectId | undefined
): Promise<void> => {
  if (count < 1) {
    await User.findByIdAndUpdate(
      id,
      { role: "Regular", boss: newBossId },
      { new: true }
    );
  } else if (count >= 1) {
    await User.findByIdAndUpdate(
      id,
      { role: "Boss", boss: admin },
      { new: true }
    );
  }
};
