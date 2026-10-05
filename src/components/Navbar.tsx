"use client";

import { signOut } from "firebase/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => setIsAuthenticated(Boolean(user)));
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/chat", label: "AI tutor" },
    { href: "/#curiosity", label: "Discover" },
  ];

  return (
    <header className="site-header">
      <nav aria-label="Main navigation" className="site-nav">
        <Link href="/" className="site-brand">
          <span className="site-brand-mark" aria-hidden="true">✳</span>
          <span>AI Learning <span className="site-brand-light">Assistant</span></span>
        </Link>

        <div className="site-nav-links">
          {links.map(({ href, label }) => {
            const isActive = href !== "/#curiosity" &&
              (pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)));

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`site-nav-link${isActive ? " is-active" : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="site-nav-account">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="site-account-button">
              Log out
            </button>
          ) : (
            <Link href="/login" className="site-account-button">
              Sign in <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}