"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Upload, BarChart2, Users,
  User, HelpCircle, ChevronRight, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, label, isActive, isCollapsed, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        isActive
          ? "bg-red-600 text-white"
          : "text-zinc-400 hover:text-white hover:bg-zinc-800"
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0 w-5 h-5">{icon}</div>
      {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Get user role from localStorage
  useEffect(() => {
    const checkUserRole = () => {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          setUserRole(userData.role?.toLowerCase() || null);
        } catch (error) {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    };

    checkUserRole();
    // Listen for storage changes (useful for multi-tab sync)
    window.addEventListener('storage', checkUserRole);
    
    return () => {
      window.removeEventListener('storage', checkUserRole);
    };
  }, []);

  // Player-specific navigation items (Home is only for players)
  const playerNavItems = [
    { href: "/", icon: <Home size={20} />, label: "Home" },
    { href: "/player/dashboard", icon: <BarChart2 size={20} />, label: "Dashboard" },
    { href: "/upload", icon: <Upload size={20} />, label: "Upload" },
  ];

  // Scout-specific navigation items
  const scoutNavItems = [
    { href: "/scout/dashboard", icon: <BarChart2 size={20} />, label: "Scout Dashboard" },
  ];

  // Admin-specific navigation items
  const adminNavItems = [
    { href: "/admin/dashboard", icon: <BarChart2 size={20} />, label: "Admin Dashboard" },
  ];

  // Common navigation items
  const commonNavItems = [
    { href: "/leaderboard", icon: <Users size={20} />, label: "Leaderboard" },
  ];

  // Build navigation items based on user role
  const navItems = [
    ...(userRole === 'player' ? playerNavItems : []),
    ...(userRole === 'scout' ? scoutNavItems : []),
    ...(userRole === 'admin' ? adminNavItems : []),
    ...commonNavItems,
  ];

  const secondaryNavItems = [
    { href: "/profile", icon: <User size={20} />, label: "Profile" },
    { href: "/help", icon: <HelpCircle size={20} />, label: "Help & Support" },
  ];

  return (
    <div
      className={cn(
        "fixed hidden md:flex flex-col h-screen bg-zinc-950 border-r border-zinc-800 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex-1 flex flex-col gap-1 p-3 pt-24">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>

      <div className="flex-shrink-0 flex flex-col gap-1 p-3 border-t border-zinc-800">
        {secondaryNavItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>

      <div className="p-3">
        <Button
          variant="ghost"
          size="icon"
          className="w-full flex items-center justify-center h-8 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
    </div>
  );
}
