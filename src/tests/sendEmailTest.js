// src/tests/sendEmailTest.js
import dotenv from "dotenv";
dotenv.config();

import { sendEmail } from "../services/mail.service.js"; // adjust path

await sendEmail({
  to: "gamerboy199711@gmail.com",
  subject: "Testing",
  text: "Hello",
});

console.log("Email sent");