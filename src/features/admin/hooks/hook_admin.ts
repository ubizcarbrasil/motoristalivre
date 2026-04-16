import { useState } from "react";
import type { SecaoAdmin } from "../types/tipos_admin";

export function useAdmin() {
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoAdmin>("dashboard");

  return { secaoAtiva, setSecaoAtiva };
}
