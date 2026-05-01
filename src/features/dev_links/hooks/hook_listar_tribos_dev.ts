import { useEffect, useState } from "react";
import { listarTribosDev } from "../services/servico_dev_links";
import type { TriboDev } from "../types/tipos_dev_links";

export function useListarTribosDev() {
  const [tribos, setTribos] = useState<TriboDev[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    listarTribosDev().then((lista) => {
      if (!cancelado) {
        setTribos(lista);
        setCarregando(false);
      }
    });
    return () => {
      cancelado = true;
    };
  }, []);

  return { tribos, carregando };
}
