import SERVER from "./server.js";
import connectDB from "./config/database.js";
import { connectRedis } from "./config/redis.js";

const PORT = process.env.PORT || 5000;

connectDB();
connectRedis();

SERVER.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
