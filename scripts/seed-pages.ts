import mongoose from "mongoose";
import Page from "../src/server/db/models/Page";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sqodex";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to DB");

  const allPage = await Page.findOne({ slug: "all" });
  if (!allPage) {
    await Page.create({
      title: "All Products",
      slug: "all",
      blocks: [
        {
          blockType: "hero",
          blockData: {
            heading: "All Products",
            subheading: "Explore our complete collection of meticulously designed products for maximum performance and unparalleled aesthetics.",
          }
        },
        {
          blockType: "featured-products",
          blockData: {
            limit: 20
          }
        }
      ]
    });
    console.log("Created 'all' page");
  } else {
    console.log("'all' page already exists");
  }

  const collectionsPage = await Page.findOne({ slug: "collections" });
  if (!collectionsPage) {
    await Page.create({
      title: "Collections",
      slug: "collections",
      blocks: [
        {
          blockType: "hero",
          blockData: {
            heading: "Collections",
            subheading: "Browse our curated collections to find the perfect style for any occasion.",
          }
        },
        {
          blockType: "categories-grid",
          blockData: {}
        }
      ]
    });
    console.log("Created 'collections' page");
  } else {
    console.log("'collections' page already exists");
  }

  await mongoose.disconnect();
}

seed().catch(console.error);
