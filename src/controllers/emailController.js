const Email = require("../models/email");
const { sendEmail } = require("../services/emailService");
const messageHelper = require("../utils/messageHelper");
const { errorResponse, successResponse } = require("../utils/responseHelper");
const asyncHandler = require("../utils/asyncHandler");
const emailHelper = require("../helpers/emailHelper");
const ExcelJS = require("exceljs");
const { saveOTPToDB, validateOtp } = require("../helpers/otpHelpers");
const whatsappMessage = require("../services/twillioWhatsappService");
const { createOtp, hashData } = require("../utils/functions");

// Newsletter Email Template function

module.exports = {
  subscribeNewsletter: asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
      errorResponse(res, 404, messageHelper.BAD_REQUEST);
    }
    const adminOptions = {
      from: process.env.EMAIL_USER,
      to: "metalmahesh@gmail.com",
      subject: "New Newsletter Subscription",
      text: `You have a new newsletter subscription.\n\nDetails:\nEmail: ${email}`,
    };

    const userOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for subscribing!",
      html: NewsletterEmailTemplate(),
      // html: `
      //       <div style="font-family: 'Comic Sans MS', cursive, sans-serif; background: linear-gradient(135deg, #FFE5D4 0%, #FF8C42 100%); padding: 30px; border-radius: 20px; border: 3px dashed #FF6B35; position: relative;">
      //           <div style="position: absolute; top: -15px; left: 20px; background: #FF6B35; padding: 5px 15px; border-radius: 15px; transform: rotate(-5deg);">
      //               <span style="color: white; font-size: 14px;">✨ Welcome to the Fun Zone! ✨</span>
      //           </div>
      //           <h1 style="color: #FF6B35; text-align: center; font-size: 28px; margin-top: 15px; text-shadow: 2px 2px 4px rgba(255,107,53,0.2);">
      //               🎉 Yay! You're Part of Our Club! 🎉
      //           </h1>
      //           <p style="color: #FF4E00; font-size: 18px; text-align: center; line-height: 1.6;">
      //               Get ready for awesome adventures and super cool updates!
      //               We're so excited to have you join our magical newsletter family! 🌟
      //           </p>
      //           <div style="text-align: center; margin-top: 20px; background: #FFA06B; padding: 10px; border-radius: 15px; box-shadow: 0 4px 8px rgba(255,107,53,0.2);">
      //               <span style="font-size: 24px;">🎨 📚 🚀 💫</span>
      //           </div>
      //       </div>
      //   `,
    };

    await emailHelper.saveEmailToDB({
      email,
    });
    await sendEmail(userOptions);
    await sendEmail(adminOptions);
    return successResponse(res, 200, messageHelper.NEWSLETTER_SUBSCRIBED);
  }),
  sendEmailToUser: asyncHandler(async (req, res, next) => {
    const { type, email, data } = req.body;
    if (!email || !data) {
      return errorResponse(res, 404, messageHelper.BAD_REQUEST);
    }
    const userOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to Mentoons!",

      // html: AssessementEmailTemplate("Dheeraj Sharma", email, "+916205128100", data.pdf, data.thumbnail),
      // html: SubscriptionEmailTemplate(
      //   "Dheeraj Sharma",
      //   email,
      //   "+916205128100",
      //   data.pdf,
      //   data.thumbnail
      // ),
      html: WelcomeEmailTemplate(email, data),
      // html: ProductEmailTemplate(
      //   "dheeraj",
      //   email,
      //   "Conversation Starter Card",
      //   "199"
      // ),
    };
    const isEmailSent = await sendEmail(userOptions);

    return successResponse(res, 200, messageHelper.EMAIL_SENT);
  }),
  sendProductEmail: asyncHandler(async (req, res, next) => {
    const { name, email, productName, productPrice } = req.body;
    if (!name || !email || !productName || !productPrice) {
      return errorResponse(res, 404, messageHelper.BAD_REQUEST);
    }
    const userOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Product Purchase Confirmation",
      html: ProductEmailTemplate(name, email, productName, productPrice),
    };
    const isEmailSent = await sendEmail(userOptions);
    return successResponse(res, 200, messageHelper.EMAIL_SENT);
  }),

  sendSubscriptionEmail: asyncHandler(async (req, res, next) => {
    const { name, email, phone, pdf, thumbnail } = req.body;
    if (!name || !email || !phone || !pdf || !thumbnail) {
      return errorResponse(res, 404, messageHelper.BAD_REQUEST);
    }
    const userOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to Premium Subscription",
      html: SubscriptionEmailTemplate(name, email, phone, pdf, thumbnail),
    };
    const isEmailSent = await sendEmail(userOptions);
    return successResponse(res, 200, messageHelper.EMAIL_SENT);
  }),

  sendAssessmentEmail: asyncHandler(async (req, res, next) => {
    const { name, email, phone, pdf, thumbnail } = req.body;
    if (!name || !email || !phone || !pdf || !thumbnail) {
      return errorResponse(res, 404, messageHelper.BAD_REQUEST);
    }
    const userOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Assessment Results",
      html: AssessementEmailTemplate(name, email, phone, pdf, thumbnail),
    };
    const isEmailSent = await sendEmail(userOptions);
    return successResponse(res, 200, messageHelper.EMAIL_SENT);
  }),

  // freeDownloads: asyncHandler(async (req, res, next) => {
  //     const { name, email, phone ,pdf,thumbnail } = req.body

  //     if (!name && !email && !phone && !pdf && !thumbnail) {
  //         errorResponse(res, 404, messageHelper.BAD_REQUEST)
  //     }
  //     const adminOptions = {
  //         from: process.env.EMAIL_USER,
  //         to: 'metalmahesh@gmail.com',
  //         subject: 'New free download claimed',
  //         text: `You have a new free download claimed.\n\nDetails:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`,
  //     };

  //     const userOptions = {
  //         from: process.env.EMAIL_USER,
  //         to: email,
  //         subject: 'Thank you for subscribing!',
  //         html: `
  //             <div style="font-family: 'Futura', sans-serif; background-color: #fff3cd; padding: 20px; border-radius: 8px; border: 2px solid #ffc107;">
  //                 <h1 style="color: #ffc107;">Thank you for subscribing!</h1>
  //                 <p style="color: #6c757d; font-size: 16px;">We're thrilled to have you! Click the thumbnail below to download your free PDF:</p>
  //                 <a href="${pdf}" download style="display: inline-block; text-decoration: none;">
  //                     <img src="${thumbnail}" alt="PDF Thumbnail" style="max-width: 100%; height: auto; border: 2px solid #ffc107; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
  //                 </a>
  //                 <p style="font-size: 14px; color: #6c757d; margin-top: 10px;">Happy reading!</p>
  //             </div>
  //         `,
  //     };
  //     await emailHelper.saveEmailToDB({ name, email, phone });
  //     await sendEmail(userOptions);
  //     await sendEmail(adminOptions);
  //     return successResponse(res, 200, messageHelper.FREE_DOWNLOAD_CLAIMED);
  // }),

  freeDownloadsRequest: asyncHandler(async (req, res, next) => {
    const { phone, countryCode } = req.body;
    if (!phone || !countryCode) {
      return errorResponse(res, 400, messageHelper.BAD_REQUEST);
    }
    const phoneNo = `${countryCode}${phone}`;
    console.log(phoneNo);
    const otp = await createOtp();
    const hashedOtp = await hashData(otp);
    const otpData = await saveOTPToDB({ phone, countryCode, otp: hashedOtp });
    whatsappMessage(`Your 6 digit OTP is: ${otp}`, phoneNo);
    return successResponse(res, 200, messageHelper.OTP_SENT_SUCCESSFULLY);
  }),

  freeDownloadsVerifyOtp: asyncHandler(async (req, res, next) => {
    const { name, email, phone, countryCode, pdf, thumbnail, otp } = req.body;

    if (!name || !email || !phone || !countryCode || !pdf || !thumbnail) {
      return errorResponse(res, 404, messageHelper.BAD_REQUEST);
    }
    const isValid = await validateOtp(phone, countryCode, otp);
    if (!isValid) {
      return errorResponse(res, 400, messageHelper.INVALID_OTP);
    }
    const adminOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "New free download claimed",
      text: `You have a new free download claimed.\n\nDetails:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`,
    };
    const userOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for subscribing!",
      html: `
                <div style="font-family: 'Futura', sans-serif; background-color: #fff3cd; padding: 20px; border-radius: 8px; border: 2px solid #ffc107;">
                    <h1 style="color: #ffc107;">Thank you for subscribing!</h1>
                    <p style="color: #6c757d; font-size: 16px;">We're thrilled to have you! Click the thumbnail below to download your free PDF:</p>
                    <a href="${pdf}" download style="display: inline-block; text-decoration: none;">
                        <img src="${thumbnail}" alt="PDF Thumbnail" style="max-width: 50%; height: auto; border: 2px solid #ffc107; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                    </a>
                    <p style="font-size: 14px; color: #6c757d; margin-top: 10px;">Happy reading!</p>
                </div>
            `,
    };

    await emailHelper.saveEmailToDB({ name, email, countryCode, phone });
    await sendEmail(userOptions);
    await sendEmail(adminOptions);
    return successResponse(res, 200, messageHelper.FREE_DOWNLOAD_CLAIMED);
  }),

  getLeadData: asyncHandler(async (req, res, next) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Leads");

    worksheet.columns = [
      { header: "Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Message", key: "message", width: 50 },
    ];
    const leadData = await emailHelper.getLeadsFromDB();
    leadData.forEach((user) => {
      worksheet.addRow({
        name: user.name,
        email: user.email,
        phone: user.phone,
        message: user.message,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  }),

  freeDownloadComic: asyncHandler(async (req, res, next) => {
    const { email, thumbnail, pdf } = req.body;

    if (!(email && thumbnail && pdf)) {
      throw new Error("Email, thumbnail and pdf are required fields");
    }

    const adminOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "Free Comic from Mentoons",
      text: `You have a new free download claimed.\n\nDetails:\nEmail: ${email}\n`,
    };

    const userOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for subscribing!",
      html: `
                  <div style="font-family: 'Futura', sans-serif; background-color: #f7bbc3; padding: 20px; border-radius: 8px; border: 2px solid #eb3f56;">
                      <h1 style="color: #eb3f56;">Thank you for subscribing!</h1>
                      <p style="color: #6c757d; font-size: 16px;">We're thrilled to have you! Click the thumbnail below to download your free PDF:</p>
                      <a href="${pdf}" download style="display: inline-block; text-decoration: none;">
                          <img src="${thumbnail}" alt="PDF Thumbnail" style="max-width: 50%; height: auto; border: 2px solid #eb3f56; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
                      </a>
                      <p style="font-size: 14px; color: #6c757d; margin-top: 10px;">Happy reading!</p>
                  </div>
              `,
    };

    await sendEmail(userOptions);
    await sendEmail(adminOptions);
    return successResponse(res, 200, messageHelper.FREE_DOWNLOAD_CLAIMED);
  }),

  sendNewsletterEmail: asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 400, messageHelper.BAD_REQUEST);
    }

    const adminOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "Newsletter Email Sent",
      text: `A newsletter email has been sent to: ${email}`,
    };

    const userOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mentoons Newsletter - Latest Updates!",
      html: NewsletterEmailTemplate(),
    };

    await sendEmail(userOptions);
    await sendEmail(adminOptions);
    return successResponse(res, 200, messageHelper.EMAIL_SENT);
  }),
};

const ProductEmailTemplate = (name, email, productName, productPrice) => {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png" alt="Mentoons Logo" style="max-width: 180px; height: auto;"/>
      </div>

      <div style="text-align: center; margin-bottom: 35px;">
        <h1 style="color: #2D3748; font-size: 24px; font-weight: 600; margin: 0;">
          Purchase Confirmation
        </h1>
        <p style="color: #718096; font-size: 16px; margin-top: 8px;">
          Thank you for your purchase, ${name}
        </p>
      </div>

      <div style="background-color: #F7FAFC; border-radius: 6px; padding: 25px; margin-bottom: 30px;">
        <h2 style="color: #2D3748; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">
          Order Details
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; color: #4A5568; font-size: 15px;">Product</td>
            <td style="padding: 12px 0; color: #2D3748; font-size: 15px; text-align: right;">${productName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #4A5568; font-size: 15px;">Price</td>
            <td style="padding: 12px 0; color: #2D3748; font-size: 15px; text-align: right;">₹${productPrice}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #4A5568; font-size: 15px;">Email</td>
            <td style="padding: 12px 0; color: #2D3748; font-size: 15px; text-align: right;">${email}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 35px;">
        <p style="color: #4A5568; font-size: 15px; line-height: 1.6; margin: 0;">
          We're delighted to confirm your purchase. You'll receive access to your product shortly. If you have any questions, our support team is here to help.
        </p>
      </div>

      <div style="border-top: 1px solid #E2E8F0; padding-top: 25px;">
        <div style="text-align: center;">
          <p style="color: #718096; font-size: 14px; margin: 0 0 15px 0;">
            Need assistance? Contact our support team
          </p>
          <a href="mailto:support@mentoons.com" style="color: #4299E1; text-decoration: none; font-size: 14px;">
            support@mentoons.com
          </a>
        </div>
      </div>
    </div>
  `;
};

const WelcomeEmailTemplate = (email, data) => {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 30px; position: relative; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        <div style="text-align: center; margin-bottom: 25px;">
            <img src="https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png" alt="Mentoons Logo" style="max-width: 120px; height: auto;"/>
        </div>
        
        <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; margin-bottom: 25px; ">
            <div style="background: #FFE5D4; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                <h1 style="color: #FF6B35; text-align: center; font-size: 24px; margin: 0; font-weight: 600;">
                    🎉 Welcome to Mentoons! 🎉
                </h1>
            </div>
            <p style="color: #6c757d; font-size: 16px; text-align: center; margin: 15px 0; line-height: 1.6;">
                Thank you for joining us! 🌟 Your complimentary PDF is ready for download below.
            </p>
        </div>

        <div style="text-align: center; background-color: #ffffff; border-radius: 8px; padding: 20px; margin-bottom: 25px; position: relative;">
            <!-- Decorative ribbon -->
            
            
            <a href="${data.pdf}" download style="display: inline-block; text-decoration: none;">
                <img src="${data.thumbnail}" alt="PDF Thumbnail" style="max-width: 50%; height: auto; border: 3px solid #FF6B35; border-radius: 8px; box-shadow: 0 4px 15px rgba(255,107,53,0.2); transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" />
            </a>
        </div>

        <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; text-align: center; border: 2px solid #FFE5D4;">
            <p style="color: #FF6B35; font-size: 16px; margin: 0;">
                ✨ We hope you enjoy your magical reading experience with Mentoons! ✨
            </p>
        </div>

        <div style="text-align: center; margin-top: 20px;">
            <p style="color: #adb5bd; font-size: 12px; margin: 0;">
                © 2025 Mentoons. All rights reserved. 🌟
            </p>
        </div>

        <style>
            @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
            }
        </style>
    </div>
  `;
};

const SubscriptionEmailTemplate = (name, email, phone, pdf, thumbnail) => {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #FF6B35 0%, #FF6B35 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <img src="https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png" alt="Mentoons Logo" style="width: 120px; margin-bottom: 20px;">
        <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Welcome to Premium!</h1>
      </div>

      <div style="padding: 40px 30px;">
        <div style="background-color: #F3F4F6; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
          <h2 style="color: #1F2937; font-size: 20px; margin: 0 0 15px 0;">Subscription Details</h2>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin: 0;">
            <strong>Name:</strong> ${name}<br>
            <strong>Email:</strong> ${email}<br>
            <strong>Phone:</strong> ${phone}
          </p>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <p style="color: #1F2937; font-size: 16px; line-height: 1.6;">
            Your premium content is ready! Click below to access your materials:
          </p>
          <a href="${pdf}" download style="display: inline-block; text-decoration: none;">
            <img src="${thumbnail}" alt="Content Preview" style="max-width: 300px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          </a>
        </div>

        <div style="border-top: 1px solid #E5E7EB; padding-top: 30px;">
          <h3 style="color: #1F2937; font-size: 18px; margin: 0 0 15px 0;">What's Next?</h3>
          <ul style="color: #4B5563; font-size: 16px; line-height: 1.6; padding-left: 20px;">
            <li>Explore your premium dashboard</li>
            <li>Access exclusive content</li>
            <li>Join our community discussions</li>
            <li>Get priority support</li>
          </ul>
        </div>
      </div>

      <div style="background-color: #F3F4F6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
        <p style="color: #6B7280; font-size: 14px; margin: 0;">
          Need help? Contact us at support@mentoons.com<br>
          Follow us on social media @mentoons
        </p>
      </div>
    </div>
  </div>
  `;
};

const AssessementEmailTemplate = (name, email, phone, pdf, thumbnail) => {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 15px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.2);">
      <!-- Header Section -->
      <div style="background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 40px 20px; text-align: center; border-radius: 15px 15px 0 0; position: relative;">
        <img src="https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png" alt="Mentoons Logo" style="width: 150px; margin-bottom: 20px;">
        <h1 style="color: #ffffff; font-size: 32px; margin: 0;">Your Assessment Results Are Here! 🎉</h1>
      </div>

      <!-- Main Content -->
      <div style="padding: 40px 30px;">
        <!-- Personal Greeting -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #FF6B35; font-size: 24px; margin: 0 0 15px 0;">Dear ${name},</h2>
          <p style="color: #4B5563; font-size: 18px; line-height: 1.6;">
            Thank you for completing the Mentoons Assessment! We're excited to share your personalized results and help you unlock your full potential. 🌟
          </p>
        </div>

        <!-- Assessment Report Section -->
        <div style="background-color: #FFF3EE; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
          <h3 style="color: #FF6B35; font-size: 22px; margin: 0 0 15px 0;">📊 Your Assessment Report</h3>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We've analyzed your responses and created a comprehensive report just for you. Click below to view your detailed assessment:
          </p>
          <div style="text-align: center;">
            <a href="${pdf}" download style="display: inline-block; text-decoration: none;">
              <img src="${thumbnail}" alt="Assessment Report" style="max-width: 300px; border-radius: 8px; margin: 20px 0; box-shadow: 0 4px 8px rgba(255, 107, 53, 0.15); transition: transform 0.3s ease;">
            </a>
          </div>
        </div>

        <!-- Next Steps Section -->
        <div style="background-color: #F9FAFB; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
          <h3 style="color: #FF6B35; font-size: 22px; margin: 0 0 15px 0;">🚀 Ready to Transform?</h3>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
            Want to achieve your full potential? We're here to help! Check out our:
          </p>
          <ul style="color: #4B5563; font-size: 16px; line-height: 1.8; padding-left: 20px;">
            <li><a href="https://mentoons.com" style="color: #FF6B35; text-decoration: none;">Visit our website</a> for more resources</li>
            <li><a href="https://mentoons.com/workshops" style="color: #FF6B35; text-decoration: none;">Join our workshops</a> for hands-on learning</li>
            <li>Book a <a href="https://mentoons.com/consultation" style="color: #FF6B35; text-decoration: none;">free consultation</a> with our experts</li>
          </ul>
        </div>

        <!-- Contact Information -->
        <div style="text-align: center; margin-top: 30px;">
          <h3 style="color: #FF6B35; font-size: 20px; margin: 0 0 15px 0;">📞 Let's Connect!</h3>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
            Phone: +91 XXXXXXXXXX<br>
            Email: support@mentoons.com<br>
            Follow us: @mentoons
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #FF6B35; padding: 20px; text-align: center; border-radius: 0 0 15px 15px;">
        <p style="color: #ffffff; font-size: 14px; margin: 0;">
          © 2024 Mentoons. All rights reserved.<br>
          Helping young minds reach their full potential!
        </p>
      </div>
    </div>
  `;
};

//NOTE: Create utility function for emails instead of controllers.
const NewsletterEmailTemplate = () => {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFC107; padding: 20px;">
      <!-- Header with Logo -->
      <div style="text-align: start; padding: 20px 0;">
        <img src="https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png" alt="Mentoons Logo" style="max-width: 120px; height: auto;"/>
      </div>
      
      <!-- Welcome Section -->
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #FFFFFF; font-size: 24px; margin: 0; text-transform: uppercase; font-weight: bold;">WELCOME TO</h1>
        <h1 style="color: #FFFFFF; font-size: 24px; margin: 0; text-transform: uppercase; font-weight: bold;">MENTOONS</h1>
        <h1 style="color: #FFFFFF; font-size: 24px; margin: 0; text-transform: uppercase; font-weight: bold;">NEWSLETTER</h1>
      </div>
      
      <!-- Introduction -->
      <div style="background-color: #FFFFFF; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <p style="color: #333333; font-size: 14px; line-height: 1.5; margin: 0;">
          Greetings, Special welcome to Mentoons! As part of the Mentoons Newsletter, in this issue we bring you insightful articles, upcoming workshops, and exciting news. Stay tuned for more updates!
        </p>
      </div>
      
      <!-- What's New Today Section -->
      <div style="margin-bottom: 20px;">
        <div style="background-color: #000000; border-radius: 8px; padding: 10px; text-align: center;">
          <h2 style="color: #FFFFFF; font-size: 18px; margin: 0;">WHAT'S NEW TODAY?</h2>
        </div>
        
        <!-- New Item 1 -->
        <div style="background-color: #FFFFFF; border-radius: 8px; padding: 15px; margin-top: 15px; display: flex;">
          <div style="flex: 0 0 30%;">
            <img src="https://via.placeholder.com/150" alt="Eclipse" style="width: 100%; border-radius: 5px;"/>
          </div>
          <div style="flex: 0 0 70%; padding-left: 15px;">
            <h3 style="color: #333333; font-size: 16px; margin: 0 0 10px 0;">Introducing Mentoons MyTime</h3>
            <p style="color: #666666; font-size: 14px; line-height: 1.4; margin: 0;">
              Our newest product designed to enhance your child's time management skills. Perfect for ages 5-12, this interactive tool makes learning fun.
            </p>
          </div>
        </div>
        
        <!-- New Item 2 -->
        <div style="background-color: #FFFFFF; border-radius: 8px; padding: 15px; margin-top: 15px; display: flex;">
          <div style="flex: 0 0 30%;">
            <img src="https://via.placeholder.com/150" alt="Psychologist" style="width: 100%; border-radius: 5px;"/>
          </div>
          <div style="flex: 0 0 70%; padding-left: 15px;">
            <h3 style="color: #333333; font-size: 16px; margin: 0 0 10px 0;">Meet our New Psychologist: Dr. Anisha</h3>
            <p style="color: #666666; font-size: 14px; line-height: 1.4; margin: 0;">
              We're excited to welcome Dr. Anisha to our team. With over 10 years of experience in child psychology, she brings valuable expertise to our workshops.
            </p>
          </div>
        </div>
        
        <!-- New Item 3 -->
        <div style="background-color: #FFFFFF; border-radius: 8px; padding: 15px; margin-top: 15px; display: flex;">
          <div style="flex: 0 0 30%;">
            <img src="https://via.placeholder.com/150" alt="New Books" style="width: 100%; border-radius: 5px;"/>
          </div>
          <div style="flex: 0 0 70%; padding-left: 15px;">
            <h3 style="color: #333333; font-size: 16px; margin: 0 0 10px 0;">New Exciting Books coming up for our Members!</h3>
            <p style="color: #666666; font-size: 14px; line-height: 1.4; margin: 0;">
              We've got new books set to launch in July. Stay tuned for more details on these engaging reads for children of all ages.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Upcoming Events Section -->
      <div style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <div style="width: 24px; height: 24px; background-color: #FFFFFF; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-right: 10px;">
            <span style="color: #FFC107; font-weight: bold;">📅</span>
          </div>
          <h2 style="color: #FFFFFF; font-size: 18px; margin: 0;">Upcoming Events & Workshops</h2>
        </div>
        
        <!-- Event List -->
        <div style="background-color: #FFFFFF; border-radius: 8px; padding: 15px;">
          <p style="color: #666666; font-size: 14px; line-height: 1.4; margin: 0 0 10px 0;">
            Are you ready to enhance your skills? Join our upcoming workshops!  
          </p>
          
          <!-- Event 1 -->
          <div style="display: flex; margin-bottom: 10px;">
            <div style="width: 20px; height: 20px; background-color: #FFC107; border-radius: 50%; margin-right: 10px; flex-shrink: 0; margin-top: 2px;"></div>
            <p style="color: #333333; font-size: 14px; line-height: 1.4; margin: 0;">
              <strong>Positive Parenting Masterclass</strong> - 15th Workshop
            </p>
          </div>
          
          <!-- Event 2 -->
          <div style="display: flex; margin-bottom: 10px;">
            <div style="width: 20px; height: 20px; background-color: #FFC107; border-radius: 50%; margin-right: 10px; flex-shrink: 0; margin-top: 2px;"></div>
            <p style="color: #333333; font-size: 14px; line-height: 1.4; margin: 0;">
              <strong>STEM Kids Camp</strong> - 24th Workshop
            </p>
          </div>
        </div>
      </div>
      
      <!-- Workshop Highlights Section -->
      <div style="margin-bottom: 20px;">
        <h2 style="color: #FFFFFF; font-size: 18px; margin: 0 0 15px 0;">Few of Missing Out? Here's the Highlight of our previous Workshop</h2>
        
        <!-- Workshop Image -->
        <div style="background-color: #FFFFFF; border-radius: 8px; padding: 15px;">
          <img src="https://via.placeholder.com/550x300" alt="Workshop Highlights" style="width: 100%; border-radius: 5px; margin-bottom: 15px;"/>
          <p style="color: #666666; font-size: 14px; line-height: 1.4; margin: 0;">
            Our last workshop was a huge success! Children learned about emotional intelligence through interactive games and activities. Don't miss our upcoming sessions - register today to secure your spot!
          </p>
        </div>
      </div>
      
      <!-- Membership Benefits Section -->
      <div style="margin-bottom: 20px;">
        <div style="display: flex; flex-wrap: wrap; gap: 15px;">
          <!-- Benefit 1 -->
          <div style="flex: 1 0 30%; min-width: 150px; background-color: #FFFFFF; border-radius: 8px; padding: 15px; text-align: center;">
            <img src="https://via.placeholder.com/80" alt="Benefit 1" style="width: 80px; height: 80px; margin-bottom: 10px;"/>
            <h3 style="color: #333333; font-size: 16px; margin: 0 0 10px 0;">Early Bird Access</h3>
            <p style="color: #666666; font-size: 12px; line-height: 1.4; margin: 0;">
              Get priority access to all new workshops and materials.
            </p>
            <a href="#" style="display: inline-block; background-color: #FFC107; color: #FFFFFF; padding: 5px 15px; border-radius: 4px; text-decoration: none; margin-top: 10px; font-size: 12px;">Learn More</a>
          </div>
          
          <!-- Benefit 2 -->
          <div style="flex: 1 0 30%; min-width: 150px; background-color: #FFFFFF; border-radius: 8px; padding: 15px; text-align: center;">
            <img src="https://via.placeholder.com/80" alt="Benefit 2" style="width: 80px; height: 80px; margin-bottom: 10px;"/>
            <h3 style="color: #333333; font-size: 16px; margin: 0 0 10px 0;">Free Psychologist Consultation</h3>
            <p style="color: #666666; font-size: 12px; line-height: 1.4; margin: 0;">
              One-on-one sessions with our expert child psychologists.
            </p>
            <a href="#" style="display: inline-block; background-color: #FFC107; color: #FFFFFF; padding: 5px 15px; border-radius: 4px; text-decoration: none; margin-top: 10px; font-size: 12px;">Learn More</a>
          </div>
          
          <!-- Benefit 3 -->
          <div style="flex: 1 0 30%; min-width: 150px; background-color: #FFFFFF; border-radius: 8px; padding: 15px; text-align: center;">
            <img src="https://via.placeholder.com/80" alt="Benefit 3" style="width: 80px; height: 80px; margin-bottom: 10px;"/>
            <h3 style="color: #333333; font-size: 16px; margin: 0 0 10px 0;">Exclusive Group 1 Mentorship</h3>
            <p style="color: #666666; font-size: 12px; line-height: 1.4; margin: 0;">
              Small group sessions for personalized guidance and support.
            </p>
            <a href="#" style="display: inline-block; background-color: #FFC107; color: #FFFFFF; padding: 5px 15px; border-radius: 4px; text-decoration: none; margin-top: 10px; font-size: 12px;">Learn More</a>
          </div>
        </div>
      </div>
      
      <!-- Live Contests Section -->
      <div style="margin-bottom: 20px;">
        <div style="text-align: center; margin-bottom: 15px;">
          <h2 style="color: #FFFFFF; font-size: 18px; margin: 0;">🎮 LIVE CONTESTS 🎮</h2>
          <h3 style="color: #FFFFFF; font-size: 16px; margin: 5px 0 0 0;">PARTICIPATE & WIN!</h3>
        </div>
        
        <!-- Contest Types -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <!-- Contest 1 -->
          <div style="flex: 1; background-color: #FFFFFF; border-radius: 8px; padding: 10px; text-align: center; margin-right: 10px;">
            <div style="background-color: #FFC107; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; margin: 0 auto 10px;">
              <span style="color: #FFFFFF; font-weight: bold;">1</span>
            </div>
            <h4 style="color: #333333; font-size: 14px; margin: 0 0 5px 0;">THE CLIMBER TASK</h4>
            <p style="color: #666666; font-size: 12px; line-height: 1.3; margin: 0;">
              Complete all levels and win a special prize!
            </p>
          </div>
          
          <!-- Contest 2 -->
          <div style="flex: 1; background-color: #FFFFFF; border-radius: 8px; padding: 10px; text-align: center; margin-right: 10px;">
            <div style="background-color: #FFC107; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; margin: 0 auto 10px;">
              <span style="color: #FFFFFF; font-weight: bold;">2</span>
            </div>
            <h4 style="color: #333333; font-size: 14px; margin: 0 0 5px 0;">GUESS THE EMOTION</h4>
            <p style="color: #666666; font-size: 12px; line-height: 1.3; margin: 0;">
              Identify emotions and win exciting prizes!
            </p>
          </div>
          
          <!-- Contest 3 -->
          <div style="flex: 1; background-color: #FFFFFF; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="background-color: #FFC107; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; margin: 0 auto 10px;">
              <span style="color: #FFFFFF; font-weight: bold;">3</span>
            </div>
            <h4 style="color: #333333; font-size: 14px; margin: 0 0 5px 0;">STORY TELLING</h4>
            <p style="color: #666666; font-size: 12px; line-height: 1.3; margin: 0;">
              Create a story and win a chance to get published!
            </p>
          </div>
        </div>
        
        <!-- Influencer Spotlight -->
        <div style="background-color: #FFFFFF; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <h3 style="color: #333333; font-size: 16px; margin: 0 0 15px 0; text-align: center;">Influencer Spotlight</h3>
          <div style="display: flex; justify-content: space-around;">
            <!-- Influencer 1 -->
            <div style="text-align: center;">
              <img src="https://via.placeholder.com/100" alt="Influencer 1" style="width: 100px; height: 100px; border-radius: 50%; margin-bottom: 10px;"/>
            </div>
            
            <!-- Influencer 2 -->
            <div style="text-align: center;">
              <img src="https://via.placeholder.com/100" alt="Influencer 2" style="width: 100px; height: 100px; border-radius: 50%; margin-bottom: 10px;"/>
            </div>
          </div>
          <p style="color: #666666; font-size: 14px; line-height: 1.4; margin: 15px 0 0 0; text-align: center;">
            Meet our expert speakers who will guide you in our upcoming workshops. Don't miss out!
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center;">
        <p style="color: #FFFFFF; font-size: 12px; margin: 0 0 10px 0;">
          © 2024 Mentoons. All Rights Reserved.
        </p>
        <div>
          <a href="#" style="display: inline-block; margin: 0 5px;">
            <img src="https://via.placeholder.com/30" alt="Facebook" style="width: 30px; height: 30px;"/>
          </a>
          <a href="#" style="display: inline-block; margin: 0 5px;">
            <img src="https://via.placeholder.com/30" alt="Twitter" style="width: 30px; height: 30px;"/>
          </a>
          <a href="#" style="display: inline-block; margin: 0 5px;">
            <img src="https://via.placeholder.com/30" alt="Instagram" style="width: 30px; height: 30px;"/>
          </a>
          <a href="#" style="display: inline-block; margin: 0 5px;">
            <img src="https://via.placeholder.com/30" alt="LinkedIn" style="width: 30px; height: 30px;"/>
          </a>
        </div>
      </div>
    </div>
  `;
};
