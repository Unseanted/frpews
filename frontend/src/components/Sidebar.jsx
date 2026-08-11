import { NavLink } from "react-router-dom";
import BrandMark from "./BrandMark";
import { useAuth } from "../context/AuthContext";
import {
  Activity,
  FileSpreadsheet,
  BellRing,
  ShieldAlert,
  LogIn,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", label: "Risk Dashboard", icon: Activity, roles: null },
  { to: "/data-entry", label: "Data Entry", icon: FileSpreadsheet, roles: ["administrator", "data_manager"] },
  { to: "/alerts", label: "Alert Log", icon: BellRing, roles: ["administrator"] },
  { to: "/admin", label: "Admin Panel", icon: ShieldAlert, roles: ["administrator"] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role;
  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <aside className="sticky top-0 flex h-screen w-[17.5rem] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <BrandMark />
        <div>
          <span className="block font-heading text-base font-semibold tracking-tight text-sidebar-accent-foreground">
            FRPEWS
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-sidebar-foreground/60">
            Flood Risk System
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {LINKS.filter((l) => !l.roles || l.roles.includes(role)).map((l) => {
            const Icon = l.icon;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )
                }
              >
                <Icon className="size-4 shrink-0 opacity-80 group-hover:opacity-100" />
                <span>{l.label}</span>
              </NavLink>
            );
          })}

          {!user && (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
            >
              <LogIn className="size-4 shrink-0" />
              <span>Sign in</span>
            </NavLink>
          )}
        </nav>
      </ScrollArea>

      {user && (
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 flex items-center gap-3">
            <Avatar size="sm">
              <AvatarFallback className="bg-sidebar-primary/20 text-xs font-semibold text-sidebar-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-accent-foreground">
                {user.full_name}
              </p>
              <p className="truncate text-xs capitalize text-sidebar-foreground/60">
                {user.role?.replace("_", " ")}
              </p>
            </div>
          </div>
          <Separator className="mb-3 bg-sidebar-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="mr-2 size-3.5" />
            Sign out
          </Button>
        </div>
      )}
    </aside>
  );
}
