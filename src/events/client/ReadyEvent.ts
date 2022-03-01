import { Event } from "../../structures/Event";
import mongoose from "mongoose";

export default new Event("ready", () => {
  console.log("Bot is online");

  mongoose
    .connect(process.env.mongoUri)
    .then(() => console.log("Connected to database"))
    .catch(() => console.log("Error while connecting to database"));
});
