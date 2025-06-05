import puppeteer from 'puppeteer';
import generateCleanedHtml from './pdfgen.js';
import axios from 'axios';
import { createReadStream, unlinkSync } from 'fs';
import FormData from 'form-data';
import { basename } from 'path';
import dotenv from 'dotenv';
import { createClerkClient } from '@clerk/backend';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import { sendEmail } from './mail_sender.js';

dotenv.config();

async function convertHtmlToPdf(htmlContent, outputPath, brokerName) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-web-security',
    ]
  });

  try {
    const page = await browser.newPage();

    // Add CSS to prevent component breaks and style the footer
    const htmlWithStyles = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    /* Prevent component breaks */
                    h1, h2, h3, h4, h5, h6, img, figure, pre, .company-update, .key-metric {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `;

    // Set content and wait for load
    await page.setContent(htmlWithStyles, {
      waitUntil: 'networkidle0'
    });

    // Get the total number of pages
    const pdf = await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '30px',
        right: '10px',
        bottom: '90px', // Increased bottom margin for footer
        left: '10px'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>', // Empty header
      footerTemplate: `
                <style>
                html {
                    -webkit-print-color-adjust: exact;
                }
                </style>
                <footer style="font-size: 14px; padding: 30px 10px 30px 10px; width: 100%;
                        background-color: #f1f5f9;
                        border-top: 1px solid #e2e8f0;
                        font-family: 'Arial', sans-serif;
                        margin-bottom: -20px;
                        color: #475569;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 20px;">
                        <span>© 2024 ${brokerName}</span>
                        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
                    </div>
                </footer>
            `,
      preferCSSPageSize: false
    });

    console.log(`PDF successfully created at: ${outputPath}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function sendToWhatsapp(pdfFilename, phoneNumber, weekly_report_date, name) {
  // Configuration
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const API_VERSION = 'v21.0';
  const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

  try {
    // Step 1: Upload the PDF file
    const formData = new FormData();
    formData.append('file', createReadStream(pdfFilename));
    formData.append('type', 'application/pdf');
    formData.append('messaging_product', 'whatsapp');

    const uploadResponse = await axios.post(
      `${BASE_URL}/${PHONE_NUMBER_ID}/media`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    const mediaId = uploadResponse.data.id;
    console.log('Media uploaded successfully:', mediaId);

    // Step 2: Send the template message with the uploaded file
    const messageData = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: "template",
      template: {
        name: "weekly_update_2",
        language: {
          code: "en"
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                parameter_name: "weekly_report_date", 
                text: weekly_report_date
              },
            ]
          },
          {
            type: "header",
            parameters: [
              {
                type: "document",
                document: {
                  id: mediaId,
                  filename: `Weekly Report-${name || ''}-${weekly_report_date}.pdf`,
                }
              }
            ]
          }
        ]
      }
    };

    const messageResponse = await axios.post(
      `${BASE_URL}/${PHONE_NUMBER_ID}/messages`,
      messageData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    // Delete the PDF file after sending
    unlinkSync(pdfFilename);


    return {
      success: true,
      uploadResponse: uploadResponse.data,
      messageResponse: messageResponse.data
    };

  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    throw {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

async function getSubscription(userId) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const { data: subscriptionResponse } = await supabase.from('subscriptions').select('id,is_bypassed').eq('user_id', userId);

  if (subscriptionResponse.length === 0) {
    return { success: false, error: 'Subscription not found', status: 404 };
  }

  const instance = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

  return new Promise((resolve) => {
    instance.subscriptions.fetch(subscriptionResponse[0].id, async (err, subscription) => {
      if (err) {
        resolve({ success: false, error: 'Subscription not found', status: 404 });
        return;
      }

      if (!subscription) {
        resolve({ success: false, error: 'Subscription not found', status: 404 });
        return;
      }

      if (subscription.notes?.userId !== userId) {
        resolve({ success: false, error: 'Unauthorized', status: 401 });
        return;
      }

      let isFreeTrial = subscription.status === 'authenticated';
      let isBypassed = false;
      console.log('Subscription status', subscription.status);
      if (subscriptionResponse[0].is_bypassed === true && subscription.status === 'created') {
        isFreeTrial = true;
        isBypassed = true;
      }
      const isActive = subscription.status === 'active' || isFreeTrial || subscription.status === 'pending';
      let numberOfDaysLeft = -1;
      if (isFreeTrial) {
        const subscriptionStartAt = subscription.start_at;
        const currentTime = Math.floor(Date.now() / 1000);
        numberOfDaysLeft = Math.ceil((subscriptionStartAt - currentTime) / (24 * 60 * 60));
      }

      if (!isActive) {
        resolve({ success: false, error: 'Subscription is inactive', status: 400 });
        return;
      }

      resolve({ success: true, isFreeTrial, numberOfDaysLeft, subscriptionStartAt: subscription.start_at, link: subscription.short_url });
    });
  });
}


async function generateAndSendPdf(userId, brokerId, brokerLogo, phoneNumber, emailId) {
  const regex = /\/\*([\s\S]*?)\*\//g;
  const { html, brokerName } = await generateCleanedHtml(userId, brokerId, brokerLogo);
  if (!html) {
    console.log('No data found for user:', userId);
    return;
  }
  // Replace all matches with empty string
  const htmlSafe = html.replace(regex, '');
  const currentDate = new Date();
  const weekEnding = new Date(currentDate);
  weekEnding.setDate(currentDate.getDate());
  const weekEndingStr = weekEnding.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const user = await clerkClient.users.getUser(userId);

  const clientData = {
    name: user.fullName || user.firstName || user.lastName,
    email: user.emailAddresses[0].emailAddress
  };

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  const { data: phoneNumberResponse } = await supabase.from('phone_verifications').select('phone_number').eq('user_id', userId).eq('verified', true).single();

  const phone = phoneNumberResponse.phone_number;
  if (!phone) {
    return;
  }

  // Execute the conversion
  await convertHtmlToPdf(htmlSafe, `Weekly Report-${weekEndingStr}-${clientData.email}-${brokerId}.pdf`, brokerName);
  
  // Clean up all generated files after PDF generation but before sending
  try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Path to historical_data folder
    const historicalDataDir = path.join(__dirname, 'historical_data');
    
    if (fs.existsSync(historicalDataDir)) {
      // Delete all files in historical_data directory
      const files = fs.readdirSync(historicalDataDir);
      for (const file of files) {
        const filePath = path.join(historicalDataDir, file);
        fs.unlinkSync(filePath);
        console.log(`Deleted: ${filePath}`);
      }
      
      // Delete the directory itself
      fs.rmdirSync(historicalDataDir);
      console.log(`Deleted directory: ${historicalDataDir}`);
    }
    
    // Delete any JSON files in the root directory (company data files)
    const rootFiles = fs.readdirSync(__dirname);
    for (const file of rootFiles) {
      // Only delete company-specific JSON files using regex pattern
      // Pattern matches: "Company Name-YYYY-MM-DD.json"
      const companyFilePattern = /^[A-Za-z\s]+-\d{4}-\d{2}-\d{2}\.json$/;
      if (file.endsWith('.json') && companyFilePattern.test(file)) {
        const filePath = path.join(__dirname, file);
        fs.unlinkSync(filePath);
        console.log(`Deleted company file: ${filePath}`);
      }
    }
    
    console.log('All temporary files cleaned up successfully');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
  
  const pdfName = `Weekly Report-${clientData.name || ''}-${weekEndingStr}.pdf`
  await sendEmail(emailId || clientData.email, `Your Personalized Weekly Report for the Week ending on ${weekEndingStr} by CQNow`, "Please find attached your personalized weekly report.\n\nBest regards,\nCQNow",`Weekly Report-${weekEndingStr}-${clientData.email}-${brokerId}.pdf`, pdfName);
  await sendToWhatsapp(`Weekly Report-${weekEndingStr}-${clientData.email}-${brokerId}.pdf`, phoneNumber || phone, weekEndingStr, clientData.name || '');
}

// Example usage
// const userId = "user_2q7HKkpKC97m06IvH9MBRU9Y6Hy";
// const phoneNumber = "919051414840";
const phoneNumber = "919773600410";
const emailId = "rahul.saxena@calquity.com"
const brokerId = 1;
const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="50 50 495.28 495.28" width="80" height="80">
  <defs>
    <filter id="drop-shadow-1" filterUnits="userSpaceOnUse">
      <feOffset dx="7" dy="7"/>
      <feGaussianBlur result="blur" stdDeviation="2.83"/>
      <feFlood flood-color="#000" flood-opacity=".75"/>
      <feComposite in2="blur" operator="in"/>
      <feComposite in="SourceGraphic"/>
    </filter>
    <filter id="drop-shadow-2" filterUnits="userSpaceOnUse">
      <feOffset dx="7" dy="7"/>
      <feGaussianBlur result="blur-2" stdDeviation="5"/>
      <feFlood flood-color="#000" flood-opacity=".75"/>
      <feComposite in2="blur-2" operator="in"/>
      <feComposite in="SourceGraphic"/>
    </filter>
  </defs>
  <g>
    <polyline style="fill: none; stroke: #fff; stroke-linejoin: round; stroke-width: 25px; filter: url(#drop-shadow-1);" points="285.03 177.91 285.03 142.21 136.59 142.21 136.59 285.02 433.46 285.02 433.45 427.83 285.03 427.83 285.03 249.32"/>
    <line style="fill: none; stroke: #fff; stroke-linejoin: round; stroke-width: 25px; filter: url(#drop-shadow-2);" x1="458.68" y1="453.07" x2="433.45" y2="427.83"/>
  </g>
</svg>`;
// const logo = "https://infinity.eurekasec.com/assets/client-logo.svg";
// const logo = "https://jayeshcommercial.com/wp-content/uploads/2020/09/main-logo.png";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const userList = await clerkClient.users.getUserList({
  limit: 500,
});
console.log(userList.data.length);
// for (let i = 0; i < userList.data.length; i++) {
//   const user = userList.data[i];
//   let name = user.fullName || user.firstName || user.lastName;
//   if (!name) {
//     name = user.emailAddresses[0].emailAddress;
//     name = name.split('@')[0];
//   }
//   // Remove any trailing numbers
//   name = name.replace(/\d+$/, '');
//   const userId = user.id;
//   let referralCode = name.toLowerCase().replace(/ /g, '');
//   // Generate referral code out of first 4 characters of name if 4 exist and last 5 digits of user id
//   referralCode = referralCode.slice(0, 4) + userId.slice(-5);
//   // Add 2 random digits at the end
//   // const randomDigits = Math.floor(Math.random() * 100);
//   // referralCode = referralCode + randomDigits;
//   // Make it all uppercase
//   const referralCodeUpper = referralCode.toUpperCase();
//   const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
//   await supabase.from('phone_verifications').update({ referral_code: referralCodeUpper }).eq('user_id', userId);
//   const offers = [
//     {
//       plan_id: 'plan_PeZiIdpxSH0TaF',
//       coupon_code: referralCodeUpper,
//       discount_percentage: 15,
//       is_valid: true,
//       is_yearly: false,
//       plan_type: 'CQNow Essential'
//     },
//     {
//       plan_id: 'plan_PeZjxVvYmlnsJz',
//       coupon_code: referralCodeUpper,
//       discount_percentage: 15,
//       is_valid: true,
//       is_yearly: false,
//       plan_type: 'CQNow Pro'
//     },
//     {
//       plan_id: 'plan_PeZm6Mue0Gr4Vv',
//       coupon_code: referralCodeUpper,
//       discount_percentage: 15,
//       is_valid: true,
//       is_yearly: false,
//       plan_type: 'CQNow Starter'
//     },
//     {
//       plan_id: 'plan_PeZq9Hy84JcZvw',
//       coupon_code: referralCodeUpper,
//       discount_percentage: 15,
//       is_valid: true,
//       is_yearly: true,
//       plan_type: 'CQNow Starter Yearly'
//     },
//     {
//       plan_id: 'plan_PeZsLeodTV60EL',
//       coupon_code: referralCodeUpper,
//       discount_percentage: 15,
//       is_valid: true,
//       is_yearly: true,
//       plan_type: 'CQNow Essential Yearly'
//     },
//     {
//       plan_id: 'plan_PeZtl2jWdYHBFc',
//       coupon_code: referralCodeUpper,
//       discount_percentage: 15,
//       is_valid: true,
//       is_yearly: true,
//       plan_type: 'CQNow Pro Yearly'
//     }
//   ];
  
//   const { data, error } = await supabase
//     .from('offers')
//     .insert(offers)
//     .select()
// }

for (let i = userList.data.length - 1; i >= 0; i--) {
  const user = userList.data[i];
  if (user.emailAddresses[0].emailAddress !== "rahul.saxena@calquity.com") {
    continue;
  }
  // if (user.emailAddresses[0].emailAddress !== "aditagarwal10@gmail.com" && user.emailAddresses[0].emailAddress !== "choudharysahil1710@gmail.com") {
  //   continue;
  // }
  // const whiteList = ["paranjaybiz@gmail.com"];
  // if (!whiteList.includes(user.emailAddresses[0].emailAddress)) {
  //   continue;
  // }

  // if (user.emailAddresses[0].emailAddress !== "aditagarwal10@gmail.com") {
  //   continue;
  // }
  // if (user.emailAddresses[0].emailAddress !== "paranjaybiz@gmail.com") {
  //   continue
  // }
  console.log(user.emailAddresses[0].emailAddress);
  const subscription = await getSubscription(user.id);
  if (subscription.success) {
    console.log(subscription.success);
    await generateAndSendPdf(user.id, brokerId, logo, phoneNumber, emailId);
  } else {
    console.log(subscription.error);
  }
}
// await sendToWhatsapp("SampleMorningReport.pdf", phoneNumber, "12th March 2022", "Pratham");
// await generateAndSendPdf("user_2q9y1PVRvqZ8gQeNktQpJ872KkK", brokerId, logo);
