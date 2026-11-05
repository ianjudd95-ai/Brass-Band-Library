import { getCurrentUser } from "@/lib/auth";
import { SignOutButton } from "./SignOutButton";

export async function UserMenu() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-slate-600 sm:inline">
        {user.email}
      </span>
      <SignOutButton />
    </div>
  );
}
