'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  title: string;
  href: string;
  items?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Getting Started',
    href: '/docs/getting-started',
  },
  {
    title: 'API Reference',
    href: '/docs/api',
    items: [
      { title: 'Authentication', href: '/docs/api/authentication' },
      { title: 'Core Endpoints', href: '/docs/api/core-endpoints' },
      { title: 'Error Handling', href: '/docs/api/error-handling' },
    ],
  },
  {
    title: 'Components',
    href: '/docs/components',
    items: [
      { title: 'BatchExport', href: '/docs/components/batch-export' },
      { title: 'ExportOptimization', href: '/docs/components/export-optimization' },
    ],
  },
  {
    title: 'Integration Guides',
    href: '/docs/guides',
    items: [
      { title: 'Batch Export Implementation', href: '/docs/guides/batch-export-implementation' },
      { title: 'Export Optimization', href: '/docs/guides/optimization' },
      { title: 'Best Practices', href: '/docs/guides/best-practices' },
      { title: 'Troubleshooting', href: '/docs/guides/troubleshooting' },
    ],
  },
];

const NavLink = ({ href, children, isActive }: { href: string; children: React.ReactNode; isActive: boolean }) => (
  <Link
    href={href}
    className={`doc-nav-link ${isActive ? 'active' : ''}`}
  >
    {children}
  </Link>
);

const SubNavItem = ({ item, currentPath }: { item: NavItem; currentPath: string }) => {
  const isActive = currentPath === item.href;
  
  return (
    <li className="ml-4">
      <NavLink href={item.href} isActive={isActive}>
        {item.title}
      </NavLink>
    </li>
  );
};

const NavItemComponent = ({ item, currentPath }: { item: NavItem; currentPath: string }) => {
  const isActive = currentPath === item.href;
  const isActiveSection = currentPath.startsWith(item.href + '/') || isActive;

  return (
    <li className="mb-2">
      <NavLink href={item.href} isActive={isActive}>
        {item.title}
      </NavLink>
      {item.items && isActiveSection && (
        <ul className="mt-1 space-y-1">
          {item.items.map((subItem) => (
            <SubNavItem key={subItem.href} item={subItem} currentPath={currentPath} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default function SideNav() {
  const currentPath = usePathname();

  return (
    <nav className="w-64 pr-8 py-6">
      <ul className="space-y-2">
        {navItems.map((item) => (
          <NavItemComponent key={item.href} item={item} currentPath={currentPath} />
        ))}
      </ul>
    </nav>
  );
}
