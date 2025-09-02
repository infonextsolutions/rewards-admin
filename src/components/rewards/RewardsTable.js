export default function RewardsTable({
  activeTab,
  data,
  onEdit,
  onDelete,
  className = ""
}) {
  const renderTableHeaders = () => {
    switch (activeTab) {
      case "XP Tiers":
        return (
          <tr className="bg-[#ecf8f1]">
            <th className="text-left py-4 px-3 font-semibold text-[#333333] text-sm">Tier Name</th>
            <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">XP Range</th>
            <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">Badge</th>
            <th className="text-left py-4 px-2 font-semibold text-[#333333] text-sm">Access Benefits</th>
            <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">Status</th>
            <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">Actions</th>
          </tr>
        );
      case "XP Decay Settings":
        return (
          <tr className="bg-[#ecf8f1]">
            <th className="text-left py-4 px-3 font-semibold text-[#333333] text-sm">Tier Name</th>
            <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">XP Range</th>
            <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">Decay Rule</th>
            <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">Inactivity Duration</th>
            <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">Min XP Limit</th>
            <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">Notifications</th>
            <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">Actions</th>
          </tr>
        );
      case "XP Conversion":
        return (
          <tr className="bg-[#ecf8f1]">
            <th className="text-left py-4 px-3 font-semibold text-[#333333] text-sm">Tier Name</th>
            <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">XP Range</th>
            <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">Conversion Ratio</th>
            <th className="text-left py-4 px-2 font-semibold text-[#333333] text-sm">Redemption Channels</th>
            <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">Status</th>
            <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">Actions</th>
          </tr>
        );
      case "Bonus Logic":
        return (
          <tr className="bg-[#ecf8f1]">
            <th className="text-left py-4 px-3 font-semibold text-[#333333] text-sm">Bonus Type</th>
            <th className="text-left py-4 px-2 font-semibold text-[#333333] text-sm">Trigger Condition</th>
            <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">Reward Value</th>
            <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">Status</th>
            <th className="text-center py-4 px-2 font-semibold text-[#333333] text-sm">Actions</th>
          </tr>
        );
      default:
        return null;
    }
  };

  const renderTableRow = (item, index) => {
    switch (activeTab) {
      case "XP Tiers":
        return (
          <tr key={item.id} className={`border-b border-[#d0d6e7] hover:bg-gray-50 transition-colors ${index === data.length - 1 ? "border-b-0" : ""}`}>
            <td className="py-4 px-3">
              <div className="flex items-center gap-2">
                <div
                  className="inline-flex justify-center gap-1 px-2 py-1.5 rounded-full border border-solid items-center"
                  style={{
                    backgroundColor: item.bgColor,
                    borderColor: item.borderColor,
                  }}
                >
                  <img className="w-3 h-3 flex-shrink-0" src={item.iconSrc} alt="tier icon" />
                  <div
                    className="font-semibold text-sm text-center tracking-[0.10px] leading-4 whitespace-nowrap"
                    style={{ color: item.tierColor }}
                  >
                    {item.tierName}
                  </div>
                </div>
              </div>
            </td>
            <td className="py-4 px-2 text-center">
              <span className="text-sm text-gray-700">{item.xpRange}</span>
            </td>
            <td className="py-4 px-2 text-center">
              <span className="text-2xl">{item.badge}</span>
            </td>
            <td className="py-4 px-2">
              <span className="text-sm text-gray-700">{item.accessBenefits}</span>
            </td>
            <td className="py-4 px-2 text-center">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                item.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {item.status ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="py-4 px-2">
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => onEdit(item)}
                  className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="Edit item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(item)}
                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  title="Delete item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        );
      
      case "XP Decay Settings":
        return (
          <tr key={item.id} className={`border-b border-[#d0d6e7] hover:bg-gray-50 transition-colors ${index === data.length - 1 ? "border-b-0" : ""}`}>
            <td className="py-4 px-3">
              <span className="font-medium text-gray-900">{item.tierName}</span>
            </td>
            <td className="py-4 px-2 text-center">
              <span className="text-sm text-gray-700">{item.xpRange}</span>
            </td>
            <td className="py-4 px-2 text-center">
              <span className="text-sm text-gray-700">{item.decayRuleType}</span>
            </td>
            <td className="py-4 px-2 text-center">
              <span className="text-sm text-gray-700">{item.inactivityDuration}</span>
            </td>
            <td className="py-4 px-2 text-center">
              <span className="text-sm text-gray-700">{item.minimumXpLimit}</span>
            </td>
            <td className="py-4 px-2 text-center">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                item.notificationToggle ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {item.notificationToggle ? 'On' : 'Off'}
              </span>
            </td>
            <td className="py-4 px-2">
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => onEdit(item)}
                  className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="Edit item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(item)}
                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  title="Delete item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        );

      case "XP Conversion":
        return (
          <tr key={item.id} className={`border-b border-[#d0d6e7] hover:bg-gray-50 transition-colors ${index === data.length - 1 ? "border-b-0" : ""}`}>
            <td className="py-4 px-3">
              <span className="font-medium text-gray-900">{item.tierName}</span>
            </td>
            <td className="py-4 px-2 text-center">
              <span className="text-sm text-gray-700">{item.xpRange}</span>
            </td>
            <td className="py-4 px-2 text-center">
              <span className="text-sm text-gray-700 font-medium">{item.conversionRatio}</span>
            </td>
            <td className="py-4 px-2">
              <div className="flex flex-wrap gap-1">
                {item.redemptionChannels.map((channel, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {channel}
                  </span>
                ))}
              </div>
            </td>
            <td className="py-4 px-2 text-center">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                item.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {item.status ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="py-4 px-2">
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => onEdit(item)}
                  className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="Edit item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(item)}
                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  title="Delete item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        );

      case "Bonus Logic":
        return (
          <tr key={item.id} className={`border-b border-[#d0d6e7] hover:bg-gray-50 transition-colors ${index === data.length - 1 ? "border-b-0" : ""}`}>
            <td className="py-4 px-3">
              <span className="font-medium text-gray-900">{item.bonusType}</span>
            </td>
            <td className="py-4 px-2">
              <span className="text-sm text-gray-700">{item.triggerCondition}</span>
            </td>
            <td className="py-4 px-2 text-center">
              <span className="text-sm text-gray-700 font-medium">{item.rewardValue}</span>
            </td>
            <td className="py-4 px-2 text-center">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                item.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {item.status ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="py-4 px-2">
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => onEdit(item)}
                  className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="Edit item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(item)}
                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  title="Delete item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-[10px] border border-gray-200 w-full ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: '800px' }}>
          <thead>
            {renderTableHeaders()}
          </thead>
          <tbody>
            {data.map((item, index) => renderTableRow(item, index))}
          </tbody>
        </table>
      </div>
    </div>
  );
}