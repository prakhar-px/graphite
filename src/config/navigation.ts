import {
  BarChart3,
  Building2,
  CalendarDays,
  LayoutDashboard,
  RefreshCw,
  Settings,
  AlertTriangle,
  Layers,
  Sparkles,
} from "lucide-react";

export const mainNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "AI Coach", href: "/coach", icon: Sparkles },
  { title: "Topics", href: "/topics", icon: Layers },
  { title: "Planner", href: "/planner", icon: CalendarDays },
  { title: "Revision", href: "/revision", icon: RefreshCw },
  { title: "Mistakes", href: "/mistakes", icon: AlertTriangle },
  { title: "Companies", href: "/companies", icon: Building2 },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
] as const;

export const bottomNav = [] as const;
