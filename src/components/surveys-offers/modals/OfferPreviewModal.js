"use client";

export default function OfferPreviewModal({ isOpen, onClose, offer }) {
  // Add scrollbar styling to prevent black space
  const scrollbarStyle = {
    scrollbarWidth: "thin",
    scrollbarColor: "#cbd5e0 #ffffff",
    msOverflowStyle: "-ms-autohiding-scrollbar",
  };

  // Webkit scrollbar styles (for Chrome/Safari) - white track to prevent black space
  const webkitScrollbarStyle = `
    .offer-preview-scrollable::-webkit-scrollbar {
      width: 8px;
    }
    .offer-preview-scrollable::-webkit-scrollbar-track {
      background: #ffffff;
      border-radius: 0 0.5rem 0.5rem 0;
    }
    .offer-preview-scrollable::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 4px;
      border: 2px solid #ffffff;
    }
    .offer-preview-scrollable::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }
  `;
  if (!isOpen || !offer) return null;

  const isCashback = offer.type === "cashback";
  const isShopping = offer.type === "shopping";
  const isMagicReceipt = offer.type === "magic-receipt";
  const getProgressPercentage = () => {
    // Simulate progress for demo
    return Math.floor(Math.random() * 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <style>{webkitScrollbarStyle}</style>
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header - Fixed */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">
            Mobile Preview
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Mobile Frame */}
          <div className="p-4">
            <div className="bg-gray-900 rounded-3xl p-2 shadow-2xl">
              {/* Mobile Screen */}
              <div
                className="bg-white rounded-2xl overflow-hidden m-auto flex flex-col"
                style={{ aspectRatio: "9/19.5", maxHeight: "600px" }}
              >
                {/* Status Bar - Fixed */}
                <div className="bg-gray-100 px-4 py-2 flex justify-between items-center text-xs flex-shrink-0">
                  <span className="font-medium">9:41</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="w-4 h-2 border border-gray-400 rounded-sm"></div>
                  </div>
                </div>

                {/* App Header - Fixed */}
                <div className="bg-emerald-500 text-white p-4 flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="font-semibold">
                        {isCashback
                          ? "Cashback Offers"
                          : isShopping
                          ? "Shopping Offers"
                          : isMagicReceipt
                          ? "Magic Receipts"
                          : "Surveys"}
                      </h1>
                      <p className="text-xs text-emerald-100">
                        {isCashback
                          ? "Earn cashback on your purchases"
                          : isShopping
                          ? "Earn points on your purchases"
                          : isMagicReceipt
                          ? "Scan receipts to earn points"
                          : "Earn coins by sharing your opinions"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scrollable Content Area */}
                <div
                  className="flex-1 overflow-y-auto bg-white offer-preview-scrollable"
                  style={scrollbarStyle}
                >
                  {/* Offer Card */}
                  <div className="p-4">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                      {/* Offer Header */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {(isCashback && offer.images?.cardImage) ||
                            ((isShopping || isMagicReceipt) &&
                              offer.creatives?.images?.["600x300"]) ? (
                              <img
                                src={
                                  isCashback
                                    ? offer.images.cardImage
                                    : offer.creatives.images["600x300"]
                                }
                                alt={
                                  offer.title ||
                                  offer.merchant_name ||
                                  offer.anchor ||
                                  offer.product_name
                                }
                                className="w-full h-32 object-cover rounded-lg mb-3"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (isShopping || isMagicReceipt) &&
                              offer.creatives?.icon ? (
                              <img
                                src={offer.creatives.icon}
                                alt={
                                  offer.title ||
                                  offer.anchor ||
                                  offer.product_name
                                }
                                className="w-20 h-20 object-cover rounded-lg mb-3 mx-auto"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : null}
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {offer.title ||
                                offer.merchant_name ||
                                offer.anchor ||
                                offer.product_name ||
                                "Untitled Offer"}
                            </h3>
                            {offer.description && (
                              <p className="text-xs text-gray-600 mt-1">
                                {offer.description}
                              </p>
                            )}
                          </div>
                          {!isCashback && !isShopping && !isMagicReceipt && (
                            <div className="ml-3 text-right">
                              <div className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
                                +{offer.coinReward || 0} coins
                              </div>
                            </div>
                          )}
                          {(isShopping || isMagicReceipt) &&
                            offer.total_points && (
                              <div className="ml-3 text-right">
                                <div className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
                                  +
                                  {parseInt(
                                    offer.total_points
                                  ).toLocaleString()}{" "}
                                  pts
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Offer Details */}
                      <div className="p-4 space-y-3">
                        {isCashback ? (
                          <>
                            {/* Cashback-specific details */}
                            {offer.cashback && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Cashback:</span>
                                <span className="font-semibold text-emerald-600 text-base">
                                  {offer.cashback}%
                                  {offer.currency && ` ${offer.currency}`}
                                  {offer.up_to && " (up to)"}
                                </span>
                              </div>
                            )}
                            {offer.merchant_name && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Merchant:</span>
                                <span className="font-medium text-gray-900">
                                  {offer.merchant_name}
                                </span>
                              </div>
                            )}
                            {offer.primary_category && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Category:</span>
                                <span className="font-medium text-gray-900">
                                  {offer.primary_category}
                                </span>
                              </div>
                            )}
                            {offer.reward_delay_days !== undefined && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">
                                  Reward Delay:
                                </span>
                                <span className="font-medium text-gray-900">
                                  {offer.reward_delay_days} days
                                </span>
                              </div>
                            )}
                            {offer.country_code && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Country:</span>
                                <span className="font-medium text-gray-900">
                                  {offer.country_code}
                                </span>
                              </div>
                            )}
                            {offer.flat_payout !== undefined && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">
                                  Flat Payout:
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    offer.flat_payout
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {offer.flat_payout ? "Yes" : "No"}
                                </span>
                              </div>
                            )}
                            {offer.rank !== undefined && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Rank:</span>
                                <span className="font-medium text-gray-900">
                                  {offer.rank}
                                </span>
                              </div>
                            )}
                            {offer.terms && offer.terms.length > 0 && (
                              <div className="pt-2 border-t border-gray-100">
                                <span className="text-xs text-gray-600 font-medium">
                                  Terms:
                                </span>
                                <ul className="mt-1 space-y-1">
                                  {offer.terms.slice(0, 3).map((term, idx) => {
                                    // Handle both string and object terms
                                    const termText =
                                      typeof term === "string"
                                        ? term
                                        : term?.term ||
                                          term?.payout ||
                                          JSON.stringify(term);
                                    return (
                                      <li
                                        key={idx}
                                        className="text-xs text-gray-600"
                                      >
                                        • {termText}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : isShopping || isMagicReceipt ? (
                          <>
                            {/* Shopping/Magic Receipt-specific details */}
                            {offer.total_points && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">
                                  Total Points:
                                </span>
                                <span className="font-semibold text-emerald-600 text-base">
                                  {parseInt(
                                    offer.total_points
                                  ).toLocaleString()}{" "}
                                  pts
                                </span>
                              </div>
                            )}
                            {offer.product_name && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Product:</span>
                                <span className="font-medium text-gray-900">
                                  {offer.product_name}
                                </span>
                              </div>
                            )}
                            {offer.anchor && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Anchor:</span>
                                <span className="font-medium text-gray-900">
                                  {offer.anchor}
                                </span>
                              </div>
                            )}
                            {offer.categories &&
                              offer.categories.length > 0 && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">
                                    Category:
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {offer.categories[0]}
                                  </span>
                                </div>
                              )}
                            {offer.confirmation_time && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">
                                  Confirmation:
                                </span>
                                <span className="font-medium text-gray-900">
                                  {offer.confirmation_time}
                                </span>
                              </div>
                            )}
                            {offer.pending_time && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">
                                  Pending Time:
                                </span>
                                <span className="font-medium text-gray-900">
                                  {Math.floor(offer.pending_time / 3600)} hours
                                </span>
                              </div>
                            )}
                            {offer.offer_expires_at && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Expires:</span>
                                <span className="font-medium text-gray-900">
                                  {new Date(
                                    offer.offer_expires_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {offer.epc && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">EPC:</span>
                                <span className="font-medium text-gray-900">
                                  ${offer.epc}
                                </span>
                              </div>
                            )}
                            {offer.mobile_verification_required !==
                              undefined && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">
                                  Mobile Verification:
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    offer.mobile_verification_required
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {offer.mobile_verification_required
                                    ? "Required"
                                    : "Not Required"}
                                </span>
                              </div>
                            )}
                            {offer.is_game !== undefined && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Is Game:</span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    offer.is_game
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {offer.is_game ? "Yes" : "No"}
                                </span>
                              </div>
                            )}
                            {offer.things_to_know &&
                              offer.things_to_know.length > 0 && (
                                <div className="pt-2 border-t border-gray-100 pb-2">
                                  <span className="text-xs text-gray-600 font-medium block mb-1">
                                    Things to Know:
                                  </span>
                                  <ul className="space-y-1">
                                    {offer.things_to_know.map((item, idx) => (
                                      <li
                                        key={idx}
                                        className="text-xs text-gray-600 leading-relaxed"
                                      >
                                        • {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            {offer.requirements && (
                              <div className="pt-2 border-t border-gray-100 pb-2">
                                <span className="text-xs text-gray-600 font-medium block mb-1">
                                  Requirements:
                                </span>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                  {offer.requirements}
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {/* Survey-specific details */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">
                                Estimated time:
                              </span>
                              <span className="font-medium text-gray-900">
                                {offer.estimatedTime || 0} min
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Difficulty:</span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  offer.difficulty === "Easy"
                                    ? "bg-green-100 text-green-800"
                                    : offer.difficulty === "Medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {offer.difficulty || "Easy"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Category:</span>
                              <span className="font-medium text-gray-900">
                                {offer.category || "General"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Powered by:</span>
                              <span className="font-medium text-blue-600">
                                {offer.sdkSource ||
                                  offer.sdkProvider ||
                                  "bitlabs"}
                              </span>
                            </div>

                            {/* Progress Bar (if started) */}
                            <div className="pt-2 border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                                <span>Progress</span>
                                <span>{getProgressPercentage()}% complete</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${getProgressPercentage()}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="p-4 bg-gray-50">
                        <button className="w-full bg-emerald-500 text-white py-3 px-4 rounded-lg font-medium text-sm hover:bg-emerald-600 transition-colors">
                          {isCashback
                            ? "Shop Now"
                            : isShopping
                            ? "Get Offer"
                            : isMagicReceipt
                            ? "Scan Receipt"
                            : getProgressPercentage() > 0
                            ? "Continue Survey"
                            : "Start Survey"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info Preview */}
                  {!isCashback && (
                    <div className="px-4 pb-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="font-medium text-blue-900 text-xs mb-2">
                          Sample Questions
                        </h4>
                        <div className="space-y-2">
                          {offer.category === "Finance" && (
                            <>
                              <p className="text-xs text-blue-800">
                                • What is your primary investment goal?
                              </p>
                              <p className="text-xs text-blue-800">
                                • How familiar are you with cryptocurrency?
                              </p>
                            </>
                          )}
                          {offer.category === "Consumer" && (
                            <>
                              <p className="text-xs text-blue-800">
                                • How often do you shop online?
                              </p>
                              <p className="text-xs text-blue-800">
                                • What factors influence your purchase
                                decisions?
                              </p>
                            </>
                          )}
                          {offer.category === "Health" && (
                            <>
                              <p className="text-xs text-blue-800">
                                • How would you rate your overall health?
                              </p>
                              <p className="text-xs text-blue-800">
                                • What wellness activities do you practice?
                              </p>
                            </>
                          )}
                          {offer.category === "Technology" && (
                            <>
                              <p className="text-xs text-blue-800">
                                • Which apps do you use most frequently?
                              </p>
                              <p className="text-xs text-blue-800">
                                • How important is data privacy to you?
                              </p>
                            </>
                          )}
                          {offer.category === "Travel" && (
                            <>
                              <p className="text-xs text-blue-800">
                                • What type of vacations do you prefer?
                              </p>
                              <p className="text-xs text-blue-800">
                                • How do you typically book your travel?
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {(isCashback && offer.images?.backgroundImage) ||
                  ((isShopping || isMagicReceipt) &&
                    offer.creatives?.images) ? (
                    <div className="px-4 pb-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900 text-xs mb-2">
                          {isCashback
                            ? "Merchant Details"
                            : isMagicReceipt
                            ? "Receipt App Details"
                            : "Product Images"}
                        </h4>
                        {isCashback && offer.images?.backgroundImage ? (
                          <img
                            src={offer.images.backgroundImage}
                            alt={offer.merchant_name || offer.title}
                            className="w-full h-24 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (isShopping || isMagicReceipt) &&
                          offer.creatives?.images?.["630x315"] ? (
                          <img
                            src={offer.creatives.images["630x315"]}
                            alt={
                              offer.anchor || offer.product_name || offer.title
                            }
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : null}
                        {offer.description && (
                          <p className="text-xs text-gray-600 mt-2">
                            {offer.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Bottom Navigation - Fixed */}
                  <div className="bg-white border-t border-gray-200 p-2 flex-shrink-0">
                    <div className="flex justify-around">
                      <div className="flex flex-col items-center py-2">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full"></div>
                        <span className="text-xs text-emerald-600 mt-1">
                          Surveys
                        </span>
                      </div>
                      <div className="flex flex-col items-center py-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                        <span className="text-xs text-gray-500 mt-1">
                          Tasks
                        </span>
                      </div>
                      <div className="flex flex-col items-center py-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                        <span className="text-xs text-gray-500 mt-1">
                          Rewards
                        </span>
                      </div>
                      <div className="flex flex-col items-center py-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                        <span className="text-xs text-gray-500 mt-1">
                          Profile
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Content - Scrollable */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-600 mb-3">
              This preview shows how the{" "}
              {isCashback
                ? "cashback offer"
                : isShopping
                ? "shopping offer"
                : isMagicReceipt
                ? "magic receipt offer"
                : "survey"}{" "}
              will appear to users on mobile devices.
              {!isCashback &&
                !isShopping &&
                !isMagicReceipt &&
                ` The actual survey content is provided by ${
                  offer.sdkSource || offer.sdkProvider || "bitlabs"
                }.`}
            </div>
            {/* Detailed Information Section */}
            <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
              <h4 className="font-semibold text-sm text-gray-900 mb-2">
                All Offer Details
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Offer ID:</span>
                  <span className="font-mono text-gray-900 break-all">
                    {offer.id || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="text-gray-900">{offer.type || "N/A"}</span>
                </div>
                {isCashback && (
                  <>
                    {offer.merchant_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Merchant ID:</span>
                        <span className="font-mono text-gray-900">
                          {offer.merchant_id}
                        </span>
                      </div>
                    )}
                    {offer.rank !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rank:</span>
                        <span className="text-gray-900">{offer.rank}</span>
                      </div>
                    )}
                    {offer.tier_mappings && offer.tier_mappings.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tier Mappings:</span>
                        <span className="text-gray-900">
                          {offer.tier_mappings.length} tier(s)
                        </span>
                      </div>
                    )}
                  </>
                )}
                {(isShopping || isMagicReceipt) && (
                  <>
                    {offer.product_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Product ID:</span>
                        <span className="font-mono text-gray-900">
                          {offer.product_id}
                        </span>
                      </div>
                    )}
                    {offer.funnel_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Funnel ID:</span>
                        <span className="font-mono text-gray-900 break-all">
                          {offer.funnel_id}
                        </span>
                      </div>
                    )}
                    {offer.events && offer.events.length > 0 && (
                      <div className="flex flex-col">
                        <span className="text-gray-600 mb-1">
                          Events ({offer.events.length}):
                        </span>
                        <div className="text-xs space-y-1 max-h-24 overflow-y-auto">
                          {offer.events
                            .filter((e) => e.payable)
                            .slice(0, 3)
                            .map((event, idx) => (
                              <div key={idx} className="text-gray-700">
                                • {event.name}: {event.points} pts ($
                                {event.payout})
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    {offer.session_hours && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Session Hours:</span>
                        <span className="text-gray-900">
                          {offer.session_hours} hours
                        </span>
                      </div>
                    )}
                    {offer.disclaimer && (
                      <div className="flex flex-col">
                        <span className="text-gray-600 mb-1">Disclaimer:</span>
                        <span className="text-xs text-gray-700 break-words">
                          {offer.disclaimer.substring(0, 200)}...
                        </span>
                      </div>
                    )}
                  </>
                )}
                {offer.clickUrl && (
                  <div className="flex flex-col">
                    <span className="text-gray-600 mb-1">Click URL:</span>
                    <span
                      className="font-mono text-gray-900 text-xs break-all"
                      title={offer.clickUrl}
                    >
                      {offer.clickUrl}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Provider:</span>
                  <span className="text-gray-900">
                    {offer.provider || offer.sdkProvider || "bitlabs"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer Button */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-gray-700"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
