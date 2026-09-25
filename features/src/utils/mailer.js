const nodemailer = require('nodemailer');
const { query } = require('../config/db');
require('dotenv').config();

const getTransporter = async () => {
  let settings = {};
  try {
    const results = await query('SELECT setting_key, setting_value FROM settings');
    results.forEach(row => { settings[row.setting_key] = row.setting_value; });
  } catch (e) {
    console.error('[MAILER] Warning: Failed to fetch settings from DB. Using .env fallback', e);
  }

  // Use DB settings if available, otherwise fallback to process.env or defaults
  const host = settings.smtp_host || process.env.SMTP_HOST || 'smtp.gmail.com';
  const user = settings.smtp_user || process.env.SMTP_USER;
  const pass = (settings.smtp_pass || process.env.SMTP_PASS || '').replace(/^"|"$/g, '');
  
  console.log('[MAILER] Attempting connection with host:', host);
  console.log('[MAILER] SMTP User:', user);
  // Masking password for safety in logs but showing length and first/last chars
  console.log('[MAILER] SMTP Pass (masked):', pass ? `${pass.substring(0, 5)}...${pass.substring(pass.length - 5)} (Length: ${pass.length})` : 'MISSING');
  
  // Force 587/false if that's what the user explicitly requested for the "fix"
  return nodemailer.createTransport({
    host: host,
    port: 587,
    secure: false, // MUST be false for 587
    auth: {
      user: user,
      pass: pass,
    },
    tls: {
      rejectUnauthorized: false, // ⚠️ IMPORTANT FIX
    },
  });
};

const sendWelcomeEmail = async (email, name, password) => {
  const loginUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : 'http://localhost:3000/login'; // Adjust to production URL when deploying

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="text-align: center; padding: 20px 0; background-color: #111827;">
        <h1 style="color: #ffffff; margin: 0;">D'LUXE</h1>
      </div>
      <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: #111827;">Welcome to D'LUXE, ${name}!</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #4b5563;">
          Thank you for choosing D'LUXE for your airport concierge needs. Your booking inquiry has been received, and an account has been automatically created for you.
        </p>
        <p style="font-size: 16px; line-height: 1.5; color: #4b5563;">
          You can use this account to track your reservation status, download your manifest, and manage your details.
        </p>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #ea580c;">
          <h3 style="margin-top: 0; color: #111827; font-size: 14px; text-transform: uppercase;">Your Temporary Credentials</h3>
          <p style="margin: 10px 0 5px;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0;"><strong>Password:</strong> <span style="font-family: monospace; font-size: 16px; font-weight: bold; padding: 2px 6px; background: #e5e7eb; border-radius: 4px;">${password}</span></p>
        </div>

        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background-color: #ea580c; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Access Your Account</a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; font-style: italic;">
          * For your security, we highly recommend changing your password after your first login.
        </p>
      </div>
      <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
        &copy; ${new Date().getFullYear()} D'LUXE Concierge. All rights reserved.
      </div>
    </div>
  `;

  try {
    const transporter = await getTransporter();
    
    // Attempt fetching MAIL_FROM from DB
    let mailFrom = `"D'LUXE" <no-reply@dluxe.com>`;
    try {
        const fromSetting = await query('SELECT setting_value FROM settings WHERE setting_key = "mail_from"');
        if (fromSetting.length > 0 && fromSetting[0].setting_value) {
            mailFrom = fromSetting[0].setting_value;
        }
    } catch(e) {}

    const info = await transporter.sendMail({
      from: mailFrom,
      to: email,
      subject: "Your D'LUXE Account Credentials",
      html: htmlContent
    });
    console.log('[MAILER] Welcome email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('[MAILER] Error sending welcome email:', error);
    return false;
  }
};

const sendLeadEmail = async (email, serviceType, packages) => {
  const activePackages = packages || [];
  
  // Create HTML list of packages
  let packagesHtml = '';
  if (activePackages.length > 0) {
    packagesHtml = activePackages.map(p => `
      <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #ea580c; background-color: #f9fafb;">
        <h4 style="margin: 0 0 5px 0; color: #111827; font-size: 16px;">${p.name.toUpperCase()} <span style="float: right; color: #ea580c;">$${p.base_price || p.basePrice}</span></h4>
        <p style="margin: 0; color: #4b5563; font-size: 14px;">${p.description || 'Premium airport concierge experience.'}</p>
      </div>
    `).join('');
  } else {
    packagesHtml = '<p style="color: #4b5563;">Our packages start from $474. Contact us for custom arrangements.</p>';
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="text-align: center; padding: 20px 0; background-color: #111827;">
        <h1 style="color: #ffffff; margin: 0;">D'LUXE</h1>
      </div>
      <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: #111827;">Thank you for your inquiry!</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #4b5563;">
          We have received your price check request for exactly what you're looking for: <strong>${serviceType || 'VIP Concierge Service'}</strong>.
        </p>
        <p style="font-size: 16px; line-height: 1.5; color: #4b5563;">
          Here are our current standard service packages and their starting base prices:
        </p>
        
        <div style="margin: 30px 0;">
          ${packagesHtml}
        </div>
        
        <p style="font-size: 16px; line-height: 1.5; color: #4b5563;">
          Ready to secure your booking? Click below to return to our portal and complete your reservation. 
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/" style="background-color: #ea580c; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Complete Your Booking</a>
        </div>
      </div>
      <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
        &copy; ${new Date().getFullYear()} D'LUXE Concierge. All rights reserved.
      </div>
    </div>
  `;

  try {
    const transporter = await getTransporter();

    // Attempt fetching MAIL_FROM from DB
    let mailFrom = `"D'LUXE" <no-reply@dluxe.com>`;
    try {
        const fromSetting = await query('SELECT setting_value FROM settings WHERE setting_key = "mail_from"');
        if (fromSetting.length > 0 && fromSetting[0].setting_value) {
            mailFrom = fromSetting[0].setting_value;
        }
    } catch(e) {}

    const info = await transporter.sendMail({
      from: mailFrom,
      to: email,
      subject: "D'LUXE Package Pricing Details",
      html: htmlContent
    });
    console.log('[MAILER] Lead inquiry email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('[MAILER] Error sending lead inquiry email:', error);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendLeadEmail
};
