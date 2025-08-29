'use client';

import { useState, useEffect } from 'react';
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

export default function AdminLayout({ children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <h1 className="font-bold text-2xl text-gray-900">Jackson.</h1>
          </div>
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
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1">
        {/* Header */}
        <header className="relative w-full h-28 py-8 " role="banner">
          <div className="relative w-full h-full">
            {/* Divider line */}
            <div
              className="absolute w-px h-[40px] top-4 right-[240px] bg-[#d0d5de] rounded-[6.4px]"
              aria-hidden="true"
            />

            {/* Search section */}
            <div className="absolute w-[549px] h-[45px] top-5 left-6 bg-[#fcfcfc] rounded-[6.4px] border-[0.8px] border-solid border-[#ebebeb]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log("Searching for:", searchQuery);
                }}
                className="relative w-[501px] h-[19px] top-3 left-[22px]"
              >
                <button
                  type="submit"
                  className="absolute w-[19px] h-[19px] top-0 left-[480px] cursor-pointer hover:opacity-70 transition-opacity"
                  aria-label="Search"
                >
                  <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                <label htmlFor="search-input" className="sr-only">
                  Search for games or users
                </label>
                <input
                  id="search-input"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for games or users...."
                  className="absolute top-0.5 left-0 w-[460px] h-[18px] [font-family:'DM_Sans-Regular',Helvetica] font-normal text-[#969ba0] text-[12.8px] tracking-[0] leading-[normal] bg-transparent border-none outline-none placeholder:text-[#969ba0] focus:text-[#464154]"
                  aria-describedby="search-description"
                />
                <div id="search-description" className="sr-only">
                  Enter keywords to search for games or users
                </div>
              </form>
            </div>

            {/* User profile section */}
            <div className="absolute w-[180px] h-12 top-3 right-6">
              <div className="absolute w-[81px] h-[19px] top-[15px] left-0">
                <p className="absolute top-0 left-0 [font-family:'Barlow-Regular',Helvetica] font-normal text-[#464154] text-base tracking-[0] leading-[normal] whitespace-nowrap">
                  <span className="[font-family:'Barlow-Regular',Helvetica] font-normal text-[#464154] text-base tracking-[0]">
                    Hello,{" "}
                  </span>
                  <span className="[font-family:'Barlow-SemiBold',Helvetica] font-semibold">
                    Sam!
                  </span>
                </p>
              </div>

              <button
                className="absolute w-12 h-12 top-0 left-[130px] bg-gray-300 rounded-full hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center text-white font-semibold"
                aria-label="User profile menu"
                type="button"
              >
                S
              </button>
            </div>

            {/* Notification section */}
            <div className="absolute w-[50px] h-[38px] top-5 right-[260px]">
              <button
                className="absolute w-[38px] h-[38px] top-0 left-0 bg-[#2d9cdb26] rounded-xl hover:bg-[#2d9cdb40] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Notifications"
                type="button"
              >
                <div className="absolute w-[22px] h-[22px] top-2 left-2 flex items-center justify-center">
                  <img 
                    src="/icon_dashboard.png" 
                    alt="Notification" 
                    className="w-5 h-5"
                  />
                </div>
              </button>
            </div>
          
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}