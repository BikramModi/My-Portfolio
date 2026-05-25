import SERVER from "./server.js";
import connectDB from "./config/database.js";

const PORT = process.env.PORT;

connectDB();

SERVER.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
