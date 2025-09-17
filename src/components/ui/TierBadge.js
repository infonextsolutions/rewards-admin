'use client';

const TierBadge = ({ tier, showIcon = true, className = '' }) => {
  if (!tier) return null;

  const getTierStyle = (tier) => {
    switch (tier) {
      case 'Bronze': return 'bg-amber-100 text-amber-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Platinum': return 'bg-purple-100 text-purple-800';
      case 'All Tiers': return 'bg-blue-100 text-blue-800';
      case 'All': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierIcon = (tier) => {
    if (!showIcon) return null;

    switch (tier) {
      case 'Bronze': return '🟤';
      case 'Gold': return '🟡';
      case 'Platinum': return '🟣';
      case 'All Tiers': return '🔵';
      case 'All': return '🔵';
      default: return '⚫';
    }
  };

  const baseClasses = `inline-flex items-center justify-center w-[80px] px-3 py-1 rounded-full text-xs font-medium`;
  const tierStyle = getTierStyle(tier);
  const icon = getTierIcon(tier);

  return (
    <span className={`${baseClasses} ${tierStyle} ${className}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {tier}
    </span>
  );
};

export default TierBadge;