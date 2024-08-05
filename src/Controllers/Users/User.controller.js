import { User } from "../../Models/Users/Users.model";
import { AppError } from "../../Utils/AppError";

const findUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return user;
};
export { findUserById };
