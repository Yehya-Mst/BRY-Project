import React from "react";
import { Shell } from "../components/layout/Shell";
import { Home } from "../pages/Home";
import { Register } from "../pages/Register";
import { Profile } from "../pages/Profile";
import { Dashboard } from "../pages/Dashboard";
import { Following } from "../pages/Following";
import { LiveStreams } from "../pages/LiveStreams";
import { Categories } from "../pages/Categories";
import { Clips } from "../pages/Clips";
import { StreamWatch } from "../pages/StreamWatch";
import { ShareModalHost } from "../components/modals/ShareModal";

type Route = "home" | "register" | "profile" | "dashboard" | "following" | "live" | "categories" | "clips" | "stream";

function parseRoute(): { route: Route; username?: string; streamId?: string } {
  const h = window.location.hash.replace("#", "") || "/";
  const parts = h.split("/").filter(Boolean);

  if (parts.length === 0) return { route: "home" };
  if (parts[0] === "register") return { route: "register" };
  if (parts[0] === "dashboard") return { route: "dashboard" };
  if (parts[0] === "following") return { route: "following" };
  if (parts[0] === "live") return { route: "live" };
  if (parts[0] === "categories") return { route: "categories" };
  if (parts[0] === "clips") return { route: "clips" };
  if (parts[0] === "stream" && parts[1]) return { route: "stream", streamId: parts[1] };
  if (parts[0] === "profile" && parts[1]) return { route: "profile", username: parts[1] };
  return { route: "home" };
}

export function App() {
  const [state, setState] = React.useState(parseRoute());

  React.useEffect(() => {
    const onHash = () => setState(parseRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  let page: React.ReactNode = null;
  if (state.route === "home") page = <Home />;
  if (state.route === "register") page = <Register />;
  if (state.route === "profile") page = <Profile username={state.username!} />;
  if (state.route === "dashboard") page = <Dashboard />;
  if (state.route === "following") page = <Following />;
  if (state.route === "live") page = <LiveStreams />;
  if (state.route === "categories") page = <Categories />;
  if (state.route === "clips") page = <Clips />;
  if (state.route === "stream") page = <StreamWatch streamId={state.streamId!} />;

  return (
    <>
      <Shell>{page}</Shell>
      <ShareModalHost />
    </>
  );
}
