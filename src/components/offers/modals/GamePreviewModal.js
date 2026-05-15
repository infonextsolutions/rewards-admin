"use client";

export default function GamePreviewModal({ isOpen, onClose, game, coinsPerDollar = 50 }) {
  if (!isOpen || !game) return null;

  const getTierIcon = (tier) => {
    switch (tier) {
      case "Gold":
        return "🟡";
      case "Platinum":
        return "🟣";
      case "Bronze":
        return "🟤";
      case "All":
        return "🔵";
      default:
        return "⚫";
    }
  };

  const getCountryFlag = (countryCode) => {
    const flags = {
      US: "🇺🇸",
      CA: "🇨🇦",
      UK: "🇬🇧",
      AU: "🇦🇺",
      DE: "🇩🇪",
      FR: "🇫🇷",
      ES: "🇪🇸",
      IT: "🇮🇹",
      NL: "🇳🇱",
      SE: "🇸🇪",
    };
    return flags[countryCode] || "🌍";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Game Details</h2>
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

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Game Header */}
          <div className="flex items-start space-x-4">
            {/* Game Icon/Image */}
            {(() => {
              // Get image based on SDK provider
              let imageUrl = null;
              const rawData = game.besitosRawData;

              if (game.sdk === "BitLabs" || game.sdkProvider === "bitlabs") {
                // BitLabs: Use icon from creatives
                imageUrl =
                  rawData?.creatives?.icon ||
                  rawData?.icon_url ||
                  rawData?.creatives?.images?.["400x400"] ||
                  rawData?.creatives?.images?.["275x275"];
              } else if (
                game.sdk === "Besitos" ||
                game.sdkProvider === "besitos"
              ) {
                // Besitos: Use icon_url or image
                imageUrl =
                  rawData?.icon_url ||
                  rawData?.image ||
                  rawData?.square_image ||
                  rawData?.large_image;
              } else {
                // Fallback: Use metadata thumbnail
                imageUrl =
                  game.metadata?.thumbnail?.url ||
                  game.metadata?.imageUrl ||
                  game.gameDetails?.image;
              }

              if (imageUrl) {
                return (
                  <div className="flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={game.title || "Game icon"}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl items-center justify-center text-white font-bold text-lg hidden">
                      {game.title?.charAt(0) || "G"}
                    </div>
                  </div>
                );
              }

              return (
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {game.title?.charAt(0) || "G"}
                </div>
              );
            })()}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{game.title}</h3>
              <p className="text-gray-600 mt-1">ID: {game.id}</p>
              <div className="flex items-center mt-2 space-x-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    game.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : game.status === "Testing"
                      ? "bg-blue-100 text-blue-800"
                      : game.status === "Paused"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {game.status}
                </span>
                {game.adSupported && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    Ad Supported
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Game Banner/Preview Image */}
          {(() => {
            const rawData = game.besitosRawData;
            let bannerUrl = null;

            if (game.sdk === "BitLabs" || game.sdkProvider === "bitlabs") {
              // BitLabs: Use banner from creatives
              bannerUrl =
                rawData?.creatives?.images?.["600x300"] ||
                rawData?.creatives?.images?.["630x315"] ||
                rawData?.creatives?.images?.["600x200"];
            } else if (
              game.sdk === "Besitos" ||
              game.sdkProvider === "besitos"
            ) {
              // Besitos: Use large_image or banner
              bannerUrl =
                rawData?.large_image || rawData?.banner_url || rawData?.image;
            } else {
              // Fallback
              bannerUrl =
                game.metadata?.images?.banner || game.gameDetails?.large_image;
            }

            if (bannerUrl) {
              return (
                <div className="mt-4">
                  <img
                    src={bannerUrl}
                    alt={`${game.title} banner`}
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              );
            }
            return null;
          })()}

          {/* Creative Images Section (for BitLabs) */}
          {(() => {
            const rawData = game.besitosRawData;
            const isBitLabs =
              game.sdk === "BitLabs" || game.sdkProvider === "bitlabs";

            if (isBitLabs && rawData?.creatives?.images) {
              const creativeImages = rawData.creatives.images;
              const imageEntries = Object.entries(creativeImages);

              if (imageEntries.length > 0) {
                return (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Creative Images
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imageEntries.map(([size, url], index) => (
                        <div key={index} className="space-y-2">
                          <img
                            src={url}
                            alt={`${game.title} - ${size}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(url, "_blank")}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <p className="text-xs text-gray-500 text-center">
                            {size}
                          </p>
                        </div>
                      ))}
                    </div>
                    {/* Icon if available */}
                    {rawData.creatives?.icon && (
                      <div className="mt-4">
                        <h5 className="text-xs font-medium text-gray-600 mb-2">
                          Icon
                        </h5>
                        <img
                          src={rawData.creatives.icon}
                          alt={`${game.title} icon`}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              }
            }
            return null;
          })()}

          {/* Tasks/Events Section (for BitLabs) - Display one by one */}
          {(() => {
            const rawData = game.besitosRawData;
            const isBitLabs =
              game.sdk === "BitLabs" || game.sdkProvider === "bitlabs";

            if (
              isBitLabs &&
              rawData?.events &&
              Array.isArray(rawData.events) &&
              rawData.events.length > 0
            ) {
              // Calculate per-event coin rewards proportionally based on points
              // Total coins = dollars × coinsPerDollar (admin conversion rate)
              // Each event's coins = (event.points / total_points) × totalCoins
              // This ensures the total distributed coins exactly match the calculated budget
              const totalPoints = parseInt(rawData.total_points) || 0;
              const dollarAmount = parseFloat(rawData.amount) || 0;
              const totalCoins = Math.round(dollarAmount * coinsPerDollar);

              const eventsWithCoins = rawData.events.map((event) => {
                const eventPoints = parseInt(event.points) || 0;
                const coinReward =
                  totalPoints > 0 && eventPoints > 0
                    ? Math.round((eventPoints / totalPoints) * totalCoins)
                    : 0;
                return { ...event, calculatedCoinReward: coinReward };
              });

              return (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Tasks/Events
                  </h4>
                  {/* Budget summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium text-blue-900">
                          Revenue:
                        </span>{" "}
                        <span className="text-blue-700">
                          ${dollarAmount.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-900">
                          Total Points:
                        </span>{" "}
                        <span className="text-blue-700">
                          {totalPoints.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-900">
                          Total Coin Budget:
                        </span>{" "}
                        <span className="text-blue-700 font-bold">
                          {totalCoins.toLocaleString()} coins
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Coins per task are calculated proportionally:
                      (task points / {totalPoints.toLocaleString()}) ×{" "}
                      {totalCoins.toLocaleString()} coins
                    </p>
                  </div>
                  <div className="space-y-3">
                    {eventsWithCoins.map((event, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-gray-900 mb-2">
                              {event.name || `Task ${index + 1}`}
                            </h5>
                            <div className="space-y-1 text-xs text-gray-600">
                              {event.type_id === 1 && (
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">
                                    Type:
                                  </span>
                                  <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                                    Install (CPI)
                                  </span>
                                </div>
                              )}
                              {event.type_id === 2 && (
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">
                                    Type:
                                  </span>
                                  <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                    Gameplay Goal
                                  </span>
                                </div>
                              )}
                              {event.type_id === 3 && (
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">
                                    Type:
                                  </span>
                                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                    Box/Boost Offer
                                  </span>
                                </div>
                              )}
                              {event.type_id === 13 && (
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">
                                    Type:
                                  </span>
                                  <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                                    In-App Purchase
                                  </span>
                                </div>
                              )}
                              {event.points && (
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">
                                    Points:
                                  </span>
                                  <span>{parseInt(event.points).toLocaleString()}</span>
                                </div>
                              )}
                              {event.payout && parseFloat(event.payout) > 0 && (
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">
                                    Admin Payout:
                                  </span>
                                  <span className="text-green-700 font-medium">
                                    ${parseFloat(event.payout).toFixed(2)}
                                  </span>
                                </div>
                              )}
                              {event.payable !== undefined && (
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">
                                    Payable:
                                  </span>
                                  <span
                                    className={
                                      event.payable
                                        ? "text-green-600"
                                        : "text-gray-500"
                                    }
                                  >
                                    {event.payable ? "Yes" : "No"}
                                  </span>
                                </div>
                              )}
                              {event.ttc_minutes > 0 && (
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">
                                    Est. Time:
                                  </span>
                                  <span>{event.ttc_minutes} min</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Coin reward badge */}
                          <div className="flex-shrink-0 ml-4 text-right">
                            {event.calculatedCoinReward > 0 ? (
                              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                                <div className="text-xs text-emerald-600 font-medium">
                                  User Reward
                                </div>
                                <div className="text-lg font-bold text-emerald-700">
                                  {event.calculatedCoinReward.toLocaleString()}
                                </div>
                                <div className="text-xs text-emerald-500">
                                  coins
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-100 rounded-lg px-3 py-2">
                                <div className="text-xs text-gray-500 font-medium">
                                  No coin reward
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Tasks/Goals Section (for Besitos) - Display one by one */}
          {(() => {
            const rawData = game.besitosRawData;
            const isBesitos =
              game.sdk === "Besitos" || game.sdkProvider === "besitos";

            if (
              isBesitos &&
              rawData?.goals &&
              Array.isArray(rawData.goals) &&
              rawData.goals.length > 0
            ) {
              const dollarAmount = parseFloat(rawData.amount) || 0;
              const totalCoins = Math.round(dollarAmount * coinsPerDollar);

              const goalsWithCoins = rawData.goals.map((goal) => {
                const goalAmount = parseFloat(goal.amount) || 0;
                const coinReward = Math.round(goalAmount * coinsPerDollar);
                return { ...goal, calculatedCoinReward: coinReward };
              });

              return (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Tasks/Goals
                  </h4>
                  {/* Budget summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium text-blue-900">
                          Revenue:
                        </span>{" "}
                        <span className="text-blue-700">
                          ${dollarAmount.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-900">
                          Conversion Rate:
                        </span>{" "}
                        <span className="text-blue-700">
                          {coinsPerDollar} coins/$
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-900">
                          Total Coins:
                        </span>{" "}
                        <span className="text-blue-700 font-bold">
                          {totalCoins.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Each goal's coins = goal amount × {coinsPerDollar}. Install goal ($0) has no coin reward (CPI payout goes to admin).
                    </p>
                  </div>
                  <div className="space-y-3">
                    {goalsWithCoins.map((goal, index) => (
                      <div
                        key={goal.goal_id || index}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-gray-900 mb-2">
                              {goal.text || `Goal ${index + 1}`}
                            </h5>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div className="flex items-center">
                                <span className="font-medium mr-2">
                                  Section:
                                </span>
                                <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                                  {goal.section === "bonus" ? "Bonus" : "Linear"}
                                </span>
                              </div>
                              {goal.days_left && (
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">
                                    Time Limit:
                                  </span>
                                  <span>{goal.days_left} days</span>
                                </div>
                              )}
                              {goal.amount && parseFloat(goal.amount) > 0 && (
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">
                                    Admin Payout:
                                  </span>
                                  <span className="text-green-700 font-medium">
                                    ${parseFloat(goal.amount).toFixed(2)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Coin reward badge */}
                          <div className="flex-shrink-0 ml-4 text-right">
                            {goal.calculatedCoinReward > 0 ? (
                              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                                <div className="text-xs text-emerald-600 font-medium">
                                  User Reward
                                </div>
                                <div className="text-lg font-bold text-emerald-700">
                                  {goal.calculatedCoinReward.toLocaleString()}
                                </div>
                                <div className="text-xs text-emerald-500">
                                  coins
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-100 rounded-lg px-3 py-2">
                                <div className="text-xs text-gray-500 font-medium">
                                  No coin reward
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* URLs Section - Make clickable */}
          {(() => {
            const rawData = game.besitosRawData;
            const isBitLabs =
              game.sdk === "BitLabs" || game.sdkProvider === "bitlabs";

            if (isBitLabs && rawData) {
              const urls = [];
              if (rawData.click_url)
                urls.push({ label: "Click URL", url: rawData.click_url });
              if (rawData.support_url)
                urls.push({ label: "Support URL", url: rawData.support_url });
              if (rawData.impression_url)
                urls.push({
                  label: "Impression URL",
                  url: rawData.impression_url,
                });

              if (urls.length > 0) {
                return (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      URLs
                    </h4>
                    <div className="space-y-2">
                      {urls.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs font-medium text-gray-600 mb-1">
                            {item.label}
                          </div>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                          >
                            {item.url}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            }
            return null;
          })()}

          {/* Screenshots Section (for BitLabs games) */}
          {(() => {
            const rawData = game.besitosRawData;
            let screenshots = [];

            if (game.sdk === "BitLabs" || game.sdkProvider === "bitlabs") {
              // BitLabs: Get screenshots from app_metadata
              screenshots = rawData?.app_metadata?.screenshot_urls || [];
            } else if (
              game.sdk === "Besitos" ||
              game.sdkProvider === "besitos"
            ) {
              // Besitos: Get screenshots if available
              screenshots = rawData?.screenshots || [];
            }

            if (screenshots.length > 0) {
              return (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Screenshots ({screenshots.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {screenshots.map((screenshot, index) => (
                      <div key={index} className="relative">
                        <img
                          src={screenshot}
                          alt={`${game.title} screenshot ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(screenshot, "_blank")}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Game Description */}
          {(() => {
            const rawData = game.besitosRawData;
            const description = rawData?.description || game.description;

            if (description) {
              return (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {description}
                  </p>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between">
          <div className="text-sm text-gray-600">
            Game configured for SDK integration and task management
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium text-sm hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
