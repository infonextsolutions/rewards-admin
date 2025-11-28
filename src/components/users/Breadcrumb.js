import React from "react";
import { useRouter } from "next/navigation";

export const Breadcrumb = ({ items = [] }) => {
  const router = useRouter();

  const handleNavigation = (path) => {
    if (path) {
      router.push(path);
    }
  };

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}

            {item.href ? (
              <button
                onClick={() => handleNavigation(item.href)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.icon && (
                  <svg
                    className="w-3.5 h-3.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    {item.icon}
                  </svg>
                )}
                <span className="leading-none">{item.label}</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900">
                {item.icon && (
                  <svg
                    className="w-3.5 h-3.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    {item.icon}
                  </svg>
                )}
                <span className="leading-none">{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
