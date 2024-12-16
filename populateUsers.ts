import mongoose from "mongoose";
import UserModel from "./database/user/user.model";
import { connectToDatabase } from "./lib/database";

// Generate multiple users
const generateUsers = (count: number) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = {
      id: `user${i + 1}`,
      email: `user${i + 1}@example.com`,
      has_email_verified: true,
      role: "user",
      username: `user${i + 1}`,
      auth_provider: "email",
      birth_date: new Date("1990-01-01"),
      display_name: `User ${i + 1}`,
      gender: "male",
      avatar: `https://example.com/user${i + 1}.jpg`,
      profile_banner: `https://example.com/user${i + 1}_banner.jpg`,
      is_disabled: false,
      last_login_at: new Date(),
      has_password: true,
      upgrade_pending: false,
      location: "New York",
      ip_address: "127.0.0.1",
      bio: `This is user ${i + 1}`,
      created_at: new Date(),
      updated_at: new Date(),
    };
    users.push(user);
  }
  return users;
};

connectToDatabase()
  .then(() => {
    console.log("Connected to MongoDB");
    const users = generateUsers(10);
    UserModel.insertMany(users)
      .then(() => {
        console.log("Users inserted successfully");
        mongoose.connection.close();
      })
      .catch((error) => {
        console.error("Error inserting users:", error.message);
        mongoose.connection.close();
      });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
