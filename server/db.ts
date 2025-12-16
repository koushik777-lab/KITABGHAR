import mongoose from "mongoose";

export async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://0.0.0.0:27017/book-nook";
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}
