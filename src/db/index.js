import mongoose from "mongoose";
import { DB_NAME } from "../contants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log(`\n MONGODB Connected !! DB HOST: 
    ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log('Mongo Connection error: ', error);
    process.exit(1);
  }
};

export default connectDB;
