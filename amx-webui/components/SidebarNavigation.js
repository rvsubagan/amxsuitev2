'use client';

import React from 'react';
import Link from 'next/link';

export default function SidebarNavigation({ sidebarOpen, setSidebarOpen }) {
  const navItems = [
    { icon: '🏠', label: 'Dashboard', href: '/' },
    { icon: '🖥️', label: 'CC AMX', href: '/cc-amx' },
    { icon: '🖥️', label: 'Alps1 AMX', href: '/alps1-amx' },
    // { icon: '🎫', label: 'Tickets', href: '/tickets' },
  ];

  return (
    <div className={`transition-all duration-300 bg-base-200 shadow-lg ${sidebarOpen ? 'w-48' : 'w-16'} h-screen flex flex-col`}>
      <button
        className="btn btn-ghost text-xl p-4"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      <ul className="menu p-2">
        {navItems.map((item, i) => (
          <li key={i}>
            <Link href={item.href} className="flex items-center gap-2">
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
