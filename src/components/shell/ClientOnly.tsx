import { useEffect, useState, type ReactNode } from "react";

/** Only renders children after first client-side mount. Prevents SSR
 *  hydration loops for components driven entirely by client-only stores. */
export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return <>{m ? children : fallback}</>;
}
