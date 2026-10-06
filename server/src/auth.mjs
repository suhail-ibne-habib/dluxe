import { createRequire } from "module";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin, bearer } from "better-auth/plugins";
import nodemailer from "nodemailer";

const require = createRequire(import.meta.url);
const { client, db } = require("./config/db");

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const baseURL = process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 5000}`;

async function sendAuthEmail({ to, subject, html, text }) {
  const rows = await db().collection("settings").find({
    key: { $in: ["smtp_host", "smtp_port", "smtp_secure", "smtp_user", "smtp_pass", "mail_from"] },
  }).toArray();
  const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  const user = settings.smtp_user || process.env.SMTP_USER;
  const pass = (settings.smtp_pass || process.env.SMTP_PASS || "").replace(/^"|"$/g, "");
  if (!user || !pass) {
    console.warn(`[MAIL] SMTP is not configured. ${subject} for ${to} was not sent.`);
    if (text) console.warn(text);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: settings.smtp_host || process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(settings.smtp_port || process.env.SMTP_PORT || 587),
    secure: (settings.smtp_secure || process.env.SMTP_SECURE) === "true",
    auth: { user, pass },
  });
  await transporter.sendMail({
    from: (settings.mail_from || process.env.MAIL_FROM || `"D'LUXE" <${user}>`).replace(/^"|"$/g, ""),
    to,
    subject,
    html,
    text,
  });
}

export const auth = betterAuth({
  appName: "D'LUXE",
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET,
  trustedOrigins: [frontendUrl],
  database: mongodbAdapter(db(), { client }),
  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: "Reset your D'LUXE password",
        text: `Reset your password: ${url}`,
        html: `<p>Reset the password for ${user.email}.</p><p><a href="${url}">Choose a new password</a></p>`,
      });
    },
  },
  plugins: [admin(), bearer()],
});

export async function ensureAdminAccount() {
  const email = process.env.ADMIN_EMAIL || "suhailibnehabib@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "123@suhail";

  const existing = await db().collection("user").findOne({ email });
  if (existing) {
    if (existing.role !== "admin") {
      await db().collection("user").updateOne({ email }, { $set: { role: "admin" } });
      console.log(`Promoted existing account to admin: ${email}`);
    } else {
      console.log(`Admin already exists: ${email}`);
    }
    return;
  }

  await auth.api.signUpEmail({
    body: { name: "Admin", email, password },
  });
  await db().collection("user").updateOne({ email }, { $set: { role: "admin" } });
  console.log(`Admin created: ${email}`);
}
