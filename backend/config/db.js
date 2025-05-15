const mongoose = require("mongoose");

const connectDB = async () => {
  const isDev = process.env.DEV_MODE === "true";
  const uri = process.env.MONGODB_URI;
  //const uri = process.env.MONGO_URI;

  try {
    const conn = await mongoose.connect(uri);
    console.log(
      `🗄️  MongoDB Connected: ${conn.connection.host} [DEV_MODE=${isDev}]`
    );
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
