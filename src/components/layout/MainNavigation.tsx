import React from "react";
import Link from "next/link";

interface MainNavProps {
  className?: string;
}

export default function MainNavigation({ className = "" }: MainNavProps) {
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Partner Brands", href: "/brands" },
    { label: "Careers", href: "/careers" },
    { label: "Blog & Insights", href: "/blog" },
    { label: "Contact Us", href: "/contact" },
  ];

  return (
    <nav className={`main-nav ${className}`} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="abid-nav-link"
        >
          {item.label}
        </Link>
      ))}

    </nav>
  );
}
