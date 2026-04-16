import { useContext } from "react";
import { ContextoTenant } from "../contexts/contexto_tenant";

export function useTenant() {
  const contexto = useContext(ContextoTenant);
  if (!contexto) {
    throw new Error("useTenant deve ser usado dentro de ProvedorTenant");
  }
  return contexto;
}
