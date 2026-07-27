import transporter from "../config/mail.js";

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  category = "General",
}) => {
  return transporter.sendMail({
    from: {
      address: process.env.MAIL_FROM_EMAIL,
      name: process.env.MAIL_FROM_NAME,
    },

    to: Array.isArray(to)
      ? to.map((email) => ({ address: email }))
      : [{ address: to }],

    subject,
    text,
    html,
    category,
  });
};

