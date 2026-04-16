import { useState } from "react";
import type { SecaoRoot } from "../types/tipos_root";

export function useRoot() {
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoRoot>("visao_geral");
  return { secaoAtiva, setSecaoAtiva };
}
