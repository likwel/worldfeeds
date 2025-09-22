import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
export default function SidebarContent({ links, closeSidebar }: { links: any[]; closeSidebar?: () => void }) {
    // const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Vérifier si l'utilisateur est connecté (ex: token dans localStorage)
    useEffect(() => {
        const token = localStorage.getItem("API_TOKEN");
        setIsAuthenticated(!!token);
    }, []);

    const visibleLinks = links.filter(link => !link.authRequired || isAuthenticated);

    return (
        <>
            <h2 className="p-4 text-2xl font-bold">🌐 {process.env.NEXT_PUBLIC_SITE_NAME ?? "WorldFeeds"}</h2>
            <nav className="px-4 flex flex-col gap-2 bg-white">
                {links.map((l) => {
                    const isActive = pathname === l.href;
                    return (
                        <a
                            key={l.href}
                            href={l.href}
                            onClick={closeSidebar}
                            className={`flex items-center gap-3 px-3 py-2 rounded font-medium transition ${isActive
                                ? "bg-blue-600 text-white"
                                : "hover:bg-gray-100 text-gray-900"
                                }`}
                        >
                            {l.icon} {l.label}
                        </a>
                    );
                })}
            </nav>
        </>
    );
}
