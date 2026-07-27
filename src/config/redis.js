import { createClient } from "redis";

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

// Fires when the client successfully connects
redisClient.on("connect", () => {
  console.log("✅ Redis Connected");
});

// Fires if the connection is lost
redisClient.on("end", () => {
  console.log("❌ Redis Connection Closed");
});

// Fires whenever an error occurs
redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

export async function connectRedis() {
  try {
    await redisClient.connect();
    console.log("🚀 Redis Ready");
  } catch (err) {
    console.error("Failed to connect Redis:", err);
    process.exit(1);
  }
}

export default redisClient;