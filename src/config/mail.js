import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";

const transporter = nodemailer.createTransport(
  MailtrapTransport({
    token: process.env.MAILTRAP_TOKEN,
  })
);

export default transporter;