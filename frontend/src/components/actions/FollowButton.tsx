import React from "react";
import { Heart } from "lucide-react";
import { api, auth } from "../../lib/api";

export function FollowButton({
  username,
  initialFollowing = false,
  className,
}: {
  username: string;
  initialFollowing?: boolean;
  className?: string;
}) {
  const [following, setFollowing] = React.useState<boolean>(initialFollowing);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    // If not logged in, do nothing; button should still render disabled by parent if desired.
    if (!auth.tokens()) return;
    // Sync status once (avoid spamming)
    api.followStatus(username)
      .then((r) => setFollowing(!!r.following))
      .catch(() => {});
  }, [username]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!auth.tokens()) return;
    if (busy) return;
    setBusy(true);
    try {
      if (following) {
        await api.unfollow(username);
        setFollowing(false);
      } else {
        await api.follow(username);
        setFollowing(true);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={!auth.tokens() || busy}
      className={className}
      title={!auth.tokens() ? "Sign in to follow" : following ? "Unfollow" : "Follow"}
      style={{
        opacity: !auth.tokens() ? 0.55 : 1,
        cursor: !auth.tokens() ? "not-allowed" : "pointer",
      }}
    >
      <div className="flex flex-col items-center gap-1">
        <Heart size={18} fill={following ? "currentColor" : "none"} />
        <span className="text-[12px]">{following ? "Followed" : "Follow"}</span>
      </div>
    </button>
  );
}
