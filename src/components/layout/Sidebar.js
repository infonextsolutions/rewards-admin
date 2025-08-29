'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: '🏠' },
  { name: 'Users', href: '/users', icon: '👥' },
  { name: 'Offers & Games', href: '/offers', icon: '🎮' },
  { name: 'Analytics & Reports', href: '/analytics', icon: '📊' },
  { name: 'Transactions', href: '/transactions', icon: '💳' },
  { name: 'Rewards', href: '/rewards', icon: '🎁' },
  { name: 'Payments', href: '/payments', icon: '💰' },
  { name: 'Remote Config', href: '/config', icon: '⚙️' },
  { name: 'Creative Manager', href: '/creative', icon: '🎨' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
  { name: 'Integrations', href: '/integrations', icon: '🔗' },
  { name: 'Support', href: '/support', icon: '🎧' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} h-screen fixed left-0 top-0 z-10`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className={`font-bold text-2xl text-gray-900 ${isCollapsed ? 'hidden' : 'block'}`}>
            Jackson.
          </h1>
          {isCollapsed && <div className="text-2xl">J</div>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}