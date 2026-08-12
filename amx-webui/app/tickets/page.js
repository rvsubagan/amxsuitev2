import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ClientPage from "./ClientPage";

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return <ClientPage session={session} />;
}
