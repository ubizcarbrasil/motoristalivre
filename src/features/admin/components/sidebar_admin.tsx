import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { MENU_ADMIN } from "../constants/constantes_admin";
import type { SecaoAdmin } from "../types/tipos_admin";
import { useLogout } from "@/compartilhados/hooks/hook_logout";

interface SidebarAdminProps {
  secaoAtiva: SecaoAdmin;
  onNavegar: (secao: SecaoAdmin) => void;
}

export function SidebarAdmin({ secaoAtiva, onNavegar }: SidebarAdminProps) {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const { sair } = useLogout();

  function handleNavegar(secao: SecaoAdmin) {
    onNavegar(secao);
    if (isMobile) setOpenMobile(false);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border px-4 py-4">
        {!collapsed && (
          <span className="text-sm font-semibold tracking-wide text-foreground">
            TriboCar Admin
          </span>
        )}
      </SidebarHeader>
      <SidebarContent>
        {MENU_ADMIN.map((grupo) => (
          <SidebarGroup key={grupo.titulo}>
            <SidebarGroupLabel className="text-xs uppercase tracking-widest text-muted-foreground">
              {!collapsed && grupo.titulo}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {grupo.itens.map((item) => {
                  const ativo = secaoAtiva === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => handleNavegar(item.id)}
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
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={sair}
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
