import User from "../models/User.js";

/**
 * Fetches a user by their email from the database.
 * @param {string} email - The email of the user to fetch.
 * @returns {Promise<Object>} - The user object if found.
 * @throws {Error} - Throws error if the user is not found or any other error occurs.
 */

export const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("User not found in the database");
    }
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("An error occurred while fetching user");
  }
};
