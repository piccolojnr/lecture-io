import { authOptions } from "@/utils/authOptions";
import SignUp from "@/components/SignUp";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return <SignUp />;
}
