import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { MENU_ROOT } from "../constants/constantes_root";
import type { SecaoRoot } from "../types/tipos_root";
import { useLogout } from "@/compartilhados/hooks/hook_logout";

interface SidebarRootProps {
  secaoAtiva: SecaoRoot;
  onNavegar: (s: SecaoRoot) => void;
}

export function SidebarRoot({ secaoAtiva, onNavegar }: SidebarRootProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  async function handleSair() {
    await supabase.auth.signOut();
    toast.success("Você saiu da conta");
    navigate("/entrar");
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border px-4 py-4">
        {!collapsed && <span className="text-sm font-semibold tracking-wide text-foreground">TriboCar Root</span>}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {MENU_ROOT.map((item) => {
                const ativo = secaoAtiva === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onNavegar(item.id)}
                      className={ativo ? "bg-accent/20 text-primary font-medium" : "text-muted-foreground hover:text-foreground"}
                    >
                      <item.icone className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSair}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
