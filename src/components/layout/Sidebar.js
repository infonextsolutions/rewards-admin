import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '/dashboard.png', href: '/' },
  { id: 'users', label: 'Users', icon: '/Users (2).png', href: '/users' },
  { id: 'offers', label: 'Offers', icon: '/Offers.png', href: '/offers' },
  { id: 'analytics', label: 'Marketing Attribution and Analytics', icon: '/Analytics and Reports.png', href: '/analytics' },
  { id: 'creative-management', label: 'Creative Management', icon: '/Fraud Monitoring.png', href: '/creative-management' },
  { id: 'transactions', label: 'Transactions', icon: '/Transactions.png', href: '/transactions' },
  { id: 'rewards', label: 'Rewards', icon: '/Rewards.png', href: '/rewards' },
  { id: 'payments', label: 'Payments', icon: '/Payments.png', href: '/payments' },
  { id: 'fraud', label: 'Fraud Monitoring', icon: '/Fraud Monitoring.png', href: '/fraud' },
  { id: 'remote-config', label: 'Remote Config', icon: '/Settings.png', href: '/remote-config' },
  { id: 'settings', label: 'Settings', icon: '/Settings.png', href: '/settings' },
  { id: 'integrations', label: 'Integrations', icon: '/Integrations.png', href: '/integrations' },
  { id: 'support', label: 'Support', icon: '/support.png', href: '/support' },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState(() => {
    const currentItem = menuItems.find(item => item.href === pathname);
    return currentItem ? currentItem.id : 'dashboard';
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-50 
        transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      {/* Logo */}
      <div className="p-6 pb-6">
        <h1 className="text-4xl  font-extrabold text-gray-800">
          Jackson<span className="text-emerald-500">.</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={() => {
                    setActiveItem(item.id);
                    onClose?.();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Image
                    src={item.icon}
                    alt={`${item.label} icon`}
                    width={20}
                    height={20}
                    className="flex-shrink-0"
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      </div>
    </>
  );
}