/** @format */

import nodemailer, { Transporter } from "nodemailer";
import ejs from "ejs";
import path from "path";
interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

const senEmail = async (options: EmailOptions): Promise<void> => {
  const transpoter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  const { email, subject, template, data } = options;
  console.log("here is your data", data);
  const tamplatePath = path.join(__dirname, "../mail", template);
  const html: string = await ejs.renderFile(tamplatePath, data);
  await transpoter.sendMail({
    from: `Ayan Mansuri A. <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject,
    html,
  });
};

export default senEmail;
