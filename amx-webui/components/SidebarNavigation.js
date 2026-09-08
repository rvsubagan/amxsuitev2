'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      icon: '🏠',
      label: 'Dashboard',
      href: '/',
    },
    {
      icon: '📟',
      label: 'CC AMX',
      href: '/cc-amx',
    },
    {
      icon: '🏔️',
      label: 'Alps1 AMX',
      href: '/alps1-amx',
    },
    {
      icon: '📊',
      label: 'Status',
      href: '/monitoring',
    },
  ];

  return (
    <aside
      className="
        w-14
        h-dvh
        shrink-0
        bg-base-200
        border-r
        border-base-content/10
        shadow-md
        flex
        flex-col
        items-center
      "
    >
      <nav
        className="
          w-full
          flex-1
          flex
          items-center
          justify-center
        "
      >
        <ul className="flex flex-col items-center gap-10">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <li
                key={item.href}
                className="w-full flex justify-center"
              >
                <Link
                  href={item.href}
                  title={item.label}
                  aria-label={item.label}
                  className={`
                    w-11
                    h-11
                    flex
                    items-center
                    justify-center
                    rounded-lg
                    text-xl
                    transition-colors
                    duration-150
                    ${
                      isActive
                        ? 'bg-primary text-primary-content'
                        : 'hover:bg-base-300'
                    }
                  `}
                >
                  {item.icon}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}