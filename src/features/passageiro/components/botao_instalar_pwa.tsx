import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInstalarPwa } from "../hooks/hook_instalar_pwa";

export function BotaoInstalarPwa() {
  const navigate = useNavigate();
  const { podeMostrarBotao, podeInstalarNativo, promptInstalacao } = useInstalarPwa();

  if (!podeMostrarBotao) return null;

  const aoClicar = async () => {
    if (podeInstalarNativo) {
      await promptInstalacao();
    } else {
      navigate("/instalar");
    }
  };

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={aoClicar}
      className="h-10 w-10 rounded-full shadow-lg"
      aria-label="Instalar app"
      title="Instalar app"
    >
      <Download className="w-5 h-5" />
    </Button>
  );
}
