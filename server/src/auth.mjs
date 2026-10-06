import { betterAuth } from "better-auth";
import { admin, bearer } from "better-auth/plugins";
import { createPool } from "mysql2/promise";
import nodemailer from "nodemailer";

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const baseURL = process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 5000}`;

const pool = createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "dluxe",
  password: process.env.DB_PASSWORD || "dluxe",
  database: process.env.DB_NAME || "dluxe",
  timezone: "Z",
  connectionLimit: 5,
  maxIdle: 1,
  idleTimeout: 15000,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

async function sendAuthEmail({ to, subject, html, text }) {
  const [rows] = await pool.query(
    "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('smtp_host','smtp_port','smtp_secure','smtp_user','smtp_pass','mail_from')"
  );
  const settings = Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value]));
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
  database: pool,
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

  await pool.query("ALTER TABLE `user` ADD COLUMN IF NOT EXISTS `role` varchar(255) DEFAULT 'user'");
  await pool.query("ALTER TABLE `user` ADD COLUMN IF NOT EXISTS `banned` tinyint(1) DEFAULT 0");
  await pool.query("ALTER TABLE `user` ADD COLUMN IF NOT EXISTS `banReason` text");
  await pool.query("ALTER TABLE `user` ADD COLUMN IF NOT EXISTS `banExpires` datetime(3) NULL");
  await pool.query("ALTER TABLE `session` ADD COLUMN IF NOT EXISTS `impersonatedBy` varchar(255) NULL");

  const [rows] = await pool.query("SELECT id, role FROM `user` WHERE email = ? LIMIT 1", [email]);
  if (rows.length > 0) {
    if (rows[0].role !== "admin") {
      await pool.query("UPDATE `user` SET role = 'admin' WHERE id = ?", [rows[0].id]);
      console.log(`Promoted existing account to admin: ${email}`);
    } else {
      console.log(`Admin already exists: ${email}`);
    }
    return;
  }

  await auth.api.signUpEmail({
    body: { name: "Admin", email, password },
  });
  await pool.query("UPDATE `user` SET role = 'admin' WHERE email = ?", [email]);
  console.log(`Admin created: ${email}`);
}
