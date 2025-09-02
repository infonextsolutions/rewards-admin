import FilterDropdown from '../ui/FilterDropdown';

export default function RewardsHeader({ 
  tabs,
  activeTab,
  onTabChange,
  filterOptions,
  selectedFilters,
  onFilterChange,
  onExport,
  onAdd,
  className = ""
}) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <header className="flex flex-col lg:flex-row w-full items-start lg:items-end justify-between gap-6">
        <div className="flex-shrink-0">
          <h1 className="[font-family:'DM_Sans-SemiBold',Helvetica] font-semibold text-[#333333] text-[25.6px] tracking-[0] leading-[normal]">
            Rewards Management
          </h1>
          <p className="[font-family:'DM_Sans-Medium',Helvetica] font-medium text-[#666666] text-[14.4px] tracking-[0] leading-[normal] mt-1">
            Manage XP tiers, decay settings, conversions, and bonus logic
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
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
            title="Export data"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Export
          </button>
          <button
            onClick={onAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors h-[42px] whitespace-nowrap"
            title="Add new item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New
          </button>
        </div>
      </header>

      {/* Tabs Section - Original Design */}
      <div className="w-full">
        <nav className="inline-flex items-start gap-4" role="tablist">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`inline-flex items-center justify-center gap-2.5 px-3 py-1 relative flex-[0_0_auto] rounded transition-colors ${
                tab.name === activeTab
                  ? "bg-[#fff2ab]"
                  : "bg-[#ebebeb] hover:bg-[#e0e0e0]"
              }`}
              onClick={() => onTabChange(tab.name)}
              role="tab"
              aria-selected={tab.name === activeTab}
            >
              <div
                className={`w-fit font-semibold tracking-[0] leading-6 whitespace-nowrap [font-family:'DM_Sans',Helvetica] text-sm ${
                  tab.name === activeTab ? "text-[#c88124]" : "text-[#757575]"
                }`}
              >
                {tab.name}
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}