import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Landing, Splash } from "@/components/landing";
import { Studio } from "@/components/studio";
import { useStudio } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [ready, setReady] = useState(false);
  const activeId = useStudio((s) => s.activeId);

  useEffect(() => {
    const done = () => setReady(true);
    const unsub = useStudio.persist.onFinishHydration(done);
    if (useStudio.persist.hasHydrated()) done();
    const t = window.setTimeout(done, 120);
    return () => {
      unsub();
      window.clearTimeout(t);
    };
  }, []);

  if (!ready) return <Splash />;
  return activeId ? <Studio /> : <Landing />;
}
