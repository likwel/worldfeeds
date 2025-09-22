import { Home, Video, Image, FileText, Code, Settings, Info, Plug, Server, Lock } from "lucide-react";

export const links = [
  { href: "/", label: "Accueil", icon: <Home size={20} /> },
  // { href: "/videos", label: "Videos", icon: <Video size={20} /> },
  // { href: "/images", label: "Images", icon: <Image size={20} /> },
  // { href: "/articles", label: "Articles", icon: <FileText size={20} /> },
  { href: "/api/docs", label: "Docs API", icon: <Server size={20} /> },
  { href: "/api", label: "Mes Clés API", icon: <Lock size={20} />, authRequired: true },
  { href: "/setting", label: "Paramètre", icon: <Settings size={20} />, authRequired: true },
  { href: "/about", label: "À propos", icon: <Info size={20} /> },
];
