import { auth } from "@/server/auth/config";
import { redirect } from "next/navigation";
import connectToDatabase from "@/server/db/mongoose";
import User from "@/server/db/models/User";
import mongoose from "mongoose";
import AddressBookClient from "./AddressBookClient";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";

export const metadata = {
  title: "My Addresses",
  description: "Manage your shipping and billing addresses",
};

export default async function AddressesPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/account/login?callbackUrl=/account/addresses");
  }

  await connectToDatabase();
  const isEnvAdmin = session.user.id === "admin-1";
  let user = null;

  if (!isEnvAdmin && session.user.id && mongoose.isValidObjectId(session.user.id)) {
    user = await User.findById(session.user.id).lean();
  } else if (session.user.email) {
    user = await User.findOne({ email: session.user.email }).lean();
  }

  // Serialize addresses to plain objects to pass to client component
  const addresses = JSON.parse(JSON.stringify(user?.addresses || []));

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="mb-8">
          <Breadcrumbs items={[{ label: 'My Account', href: '/account' }, { label: 'Addresses' }]} />
        </div>

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-foreground">
            Address Book
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage your saved shipping and billing addresses for fast checkout.
          </p>
        </div>

        <AddressBookClient initialAddresses={addresses} />
      </div>
    </div>
  );
}
