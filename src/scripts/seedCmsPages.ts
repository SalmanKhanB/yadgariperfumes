import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Import the Page model
import Page from "../server/db/models/Page";

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

async function seedPolicyPages() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB");

    const policyPages = [
      {
        title: "Privacy Policy",
        slug: "privacy-policy",
        themeConfig: {
          backgroundColor: "",
          textColor: "",
        },
        blocks: [
          {
            blockType: "rich-text",
            blockData: {
              content: `
                <h2>Privacy Policy</h2>
                <p>Last updated: ${new Date().toLocaleDateString()}</p>
                <p>We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website.</p>
                <h3>1. Important Information and Who We Are</h3>
                <p>We are the controller and responsible for your personal data.</p>
                <h3>2. The Data We Collect About You</h3>
                <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows: Identity Data, Contact Data, Financial Data, Transaction Data, Technical Data, Profile Data, Usage Data, and Marketing and Communications Data.</p>
                <h3>3. How We Use Your Personal Data</h3>
                <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances: Where we need to perform the contract we are about to enter into or have entered into with you; Where it is necessary for our legitimate interests; Where we need to comply with a legal obligation.</p>
              `,
              align: "left"
            }
          }
        ]
      },
      {
        title: "Terms of Service",
        slug: "terms-of-service",
        themeConfig: {
          backgroundColor: "",
          textColor: "",
        },
        blocks: [
          {
            blockType: "rich-text",
            blockData: {
              content: `
                <h2>Terms of Service</h2>
                <p>Last updated: ${new Date().toLocaleDateString()}</p>
                <p>Welcome to our website. If you continue to browse and use this website, you are agreeing to comply with and be bound by the following terms and conditions of use.</p>
                <h3>1. Terms</h3>
                <p>By accessing the website, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
                <h3>2. Use License</h3>
                <p>Permission is granted to temporarily download one copy of the materials (information or software) on the website for personal, non-commercial transitory viewing only.</p>
                <h3>3. Disclaimer</h3>
                <p>The materials on the website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
              `,
              align: "left"
            }
          }
        ]
      },
      {
        title: "Return & Refund Policy",
        slug: "return-refund-policy",
        themeConfig: {
          backgroundColor: "",
          textColor: "",
        },
        blocks: [
          {
            blockType: "rich-text",
            blockData: {
              content: `
                <h2>Return & Refund Policy</h2>
                <p>Last updated: ${new Date().toLocaleDateString()}</p>
                <p>Thank you for shopping with us. If you are not entirely satisfied with your purchase, we're here to help.</p>
                <h3>1. Returns</h3>
                <p>You have 30 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it. Your item must be in the original packaging. Your item needs to have the receipt or proof of purchase.</p>
                <h3>2. Refunds</h3>
                <p>Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item. If your return is approved, we will initiate a refund to your credit card (or original method of payment).</p>
                <h3>3. Shipping</h3>
                <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.</p>
              `,
              align: "left"
            }
          }
        ]
      },
      {
        title: "Shipping Policy",
        slug: "shipping-policy",
        themeConfig: {
          backgroundColor: "",
          textColor: "",
        },
        blocks: [
          {
            blockType: "rich-text",
            blockData: {
              content: `
                <h2>Shipping Policy</h2>
                <p>Last updated: ${new Date().toLocaleDateString()}</p>
                <h3>1. Shipment processing time</h3>
                <p>All orders are processed within 1-3 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.</p>
                <h3>2. Shipping rates & delivery estimates</h3>
                <p>Shipping charges for your order will be calculated and displayed at checkout. Delivery delays can occasionally occur.</p>
                <h3>3. Shipment confirmation & Order tracking</h3>
                <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.</p>
                <h3>4. Customs, Duties and Taxes</h3>
                <p>We are not responsible for any customs and taxes applied to your order. All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).</p>
              `,
              align: "left"
            }
          }
        ]
      },
      {
        title: "About Us",
        slug: "about",
        isSystemPage: true,
        blocks: [
          {
            blockType: "split-content",
            blockData: {
              heading: "The Art of Perfume",
              content: "We formulate organic scents with the highest quality ingredients from nature.",
              image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=2070",
              reverse: false
            }
          }
        ]
      },
      {
        title: "FAQ",
        slug: "faq",
        isSystemPage: true,
        blocks: [
          {
            blockType: "faq",
            blockData: {
              heading: "Frequently Asked Questions",
              items: [
                { question: "Do you ship internationally?", answer: "Yes, we ship worldwide." },
                { question: "What is your refund policy?", answer: "We offer a 30-day money-back guarantee." }
              ]
            }
          }
        ]
      },
      {
        title: "Contact",
        slug: "contact",
        isSystemPage: true,
        blocks: [
          {
            blockType: "rich-text",
            blockData: {
              heading: "Get in Touch",
              content: "<p>Have questions? Reach out to us at support@perfumeshop.com and our team will get back to you within 24 hours.</p>"
            }
          }
        ]
      }
    ];

    for (const pageData of policyPages) {
      const existingPage = await Page.findOne({ slug: pageData.slug });
      
      if (existingPage) {
        console.log(`Page '${pageData.title}' already exists. Updating system flags.`);
        existingPage.isSystemPage = pageData.isSystemPage ?? false;
        await existingPage.save();
      } else {
        const newPage = new Page(pageData);
        await newPage.save();
        console.log(`Created page: '${pageData.title}'`);
      }
    }

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding policy pages:", error);
    process.exit(1);
  }
}

seedPolicyPages();
