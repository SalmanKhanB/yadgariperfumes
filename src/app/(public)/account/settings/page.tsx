import { auth } from "@/server/auth/config";
import { redirect } from "next/navigation";
import { getUserById } from "@/server/repositories/userRepository";
import AccountSettingsClient from "./AccountSettingsClient";

export const metadata = {
  title: "Account Settings",
  description: "Manage your profile and security settings",
};

export default async function AccountSettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/account/login?callbackUrl=/account/settings");
  }

  const isEnvAdmin = session.user.id === "admin-1";
  let user = null;

  if (!isEnvAdmin) {
    user = await getUserById(session.user.id);
  }

  const userData = user ? JSON.parse(JSON.stringify(user)) : {
    name: session.user.name || "Customer",
    email: session.user.email || "",
    phone: "",
  };

  return <AccountSettingsClient user={userData} />;
}
