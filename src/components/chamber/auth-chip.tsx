import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";

export function AuthChip() {
  const { user, isPending } = useCurrentUserState();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready || isPending) {
    return <div className="h-9 w-20 shrink-0 animate-pulse rounded-full bg-fg/10" />;
  }

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link to="/login">Sign in</Link>
      </Button>
    );
  }

  const label = user.displayName ?? user.primaryEmail ?? "Account";
  return (
    <div className="flex h-9 items-center gap-2">
      {user.profileImageUrl ? (
        <img
          src={user.profileImageUrl}
          alt=""
          className="size-8 rounded-full object-cover ring-1 ring-line"
        />
      ) : (
        <span className="grid size-8 place-items-center rounded-full bg-elevated text-xs font-medium text-fg">
          {label.charAt(0).toUpperCase()}
        </span>
      )}
      <button
        type="button"
        onClick={() => void signOut()}
        className="hidden text-xs text-muted underline-offset-4 hover:text-fg hover:underline sm:inline"
      >
        Sign out
      </button>
    </div>
  );
}
