import mongoose from "mongoose";

const connectdb = async () => {
  try {
    if (!process.env.MONGO_URL) {
      console.error("MONGO_URL is not defined in environment variables.");
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URL, {
      dbName: "Campus_Sync",
    });

    console.log(`MongoDB connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectdb;
