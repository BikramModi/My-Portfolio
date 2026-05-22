import express from "express";
import connectDB from "./config/database.js";

const SERVER = express();

connectDB();


const PORT = process.env.PORT;


SERVER.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
});