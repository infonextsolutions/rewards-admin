import FilterDropdown from '../ui/FilterDropdown';

export default function UsersHeader({
  filterOptions,
  selectedFilters,
  onFilterChange,
  onExport,
  searchValue = '',
  onSearchChange,
  className = ""
}) {
  return (
    <header className={`flex flex-col lg:flex-row w-full items-start lg:items-end justify-between gap-6 mb-6 ${className}`} role="banner">
      <div className="flex-shrink-0">
        <h1 className="[font-family:'DM_Sans-SemiBold',Helvetica] font-semibold text-[#333333] text-[25.6px] tracking-[0] leading-[normal]">
          Users
        </h1>
        <p className="[font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#666666] text-[14.4px] tracking-[0] leading-[normal] mt-1">
          Track all your users activity
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end" role="toolbar" aria-label="User filters">
        {/* Search Bar */}
        <div className="relative flex-grow lg:flex-grow-0 lg:w-64">
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-[42px] text-sm"
            aria-label="Search users"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {filterOptions.map((filter) => (
          <FilterDropdown
            key={filter.id}
            filterId={filter.id}
            label={filter.label}
            options={filter.options}
            value={selectedFilters[filter.id]}
            onChange={onFilterChange}
          />
        ))}
        <button
          onClick={onExport}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-[42px] whitespace-nowrap"
          title="Export user data"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Export
        </button>
      </div>
    </header>
  );
}