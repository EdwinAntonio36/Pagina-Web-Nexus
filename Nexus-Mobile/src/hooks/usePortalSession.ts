import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export function usePortalSession() {
  const [state, setState] = useState<{ ready: boolean; session: Session | null }>({ ready: false, session: null });
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setState({ ready: true, session }));
    return () => data.subscription.unsubscribe();
  }, []);
  return state;
}
