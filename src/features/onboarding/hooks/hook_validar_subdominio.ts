import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

type StatusValidacao = "idle" | "validando" | "disponivel" | "indisponivel" | "invalido";

export function useValidarSubdominio(subdominio: string) {
  const [status, setStatus] = useState<StatusValidacao>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!subdominio || subdominio.length < 3) {
      setStatus(subdominio.length > 0 ? "invalido" : "idle");
      return;
    }

    const regex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    if (!regex.test(subdominio)) {
      setStatus("invalido");
      return;
    }

    setStatus("validando");

    timeoutRef.current = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from("tenants")
          .select("id")
          .eq("slug", subdominio)
          .maybeSingle();

        setStatus(data ? "indisponivel" : "disponivel");
      } catch {
        setStatus("idle");
      }
    }, 600);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [subdominio]);

  return status;
}
