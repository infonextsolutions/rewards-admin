export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  className = "",
  variant = "default",
}) {
  if (variant === "compact") {
    // Handle edge cases
    if (totalPages === 0) return null;

    const getVisiblePages = () => {
      const visiblePages = [];

      // Always show first page
      visiblePages.push({
        type: "page",
        label: "1",
        active: currentPage === 1,
      });

      if (totalPages <= 4) {
        // Show all pages if 4 or fewer
        for (let i = 2; i <= totalPages; i++) {
          visiblePages.push({
            type: "page",
            label: i.toString(),
            active: currentPage === i,
          });
        }
      } else {
        // Complex pagination logic
        if (currentPage <= 3) {
          // Show first 3 pages, then ellipsis, then last page
          for (let i = 2; i <= 3; i++) {
            visiblePages.push({
              type: "page",
              label: i.toString(),
              active: currentPage === i,
            });
          }
          if (totalPages > 4) {
            visiblePages.push({
              type: "ellipsis",
              label: "...",
              active: false,
            });
            visiblePages.push({
              type: "page",
              label: totalPages.toString(),
              active: currentPage === totalPages,
            });
          }
        } else if (currentPage >= totalPages - 2) {
          // Show first page, ellipsis, then last 3 pages
          visiblePages.push({ type: "ellipsis", label: "...", active: false });
          for (let i = totalPages - 2; i <= totalPages; i++) {
            visiblePages.push({
              type: "page",
              label: i.toString(),
              active: currentPage === i,
            });
          }
        } else {
          // Show first, ellipsis, current-1, current, current+1, ellipsis, last
          visiblePages.push({ type: "ellipsis", label: "...", active: false });
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            visiblePages.push({
              type: "page",
              label: i.toString(),
              active: currentPage === i,
            });
          }
          visiblePages.push({ type: "ellipsis", label: "...", active: false });
          visiblePages.push({
            type: "page",
            label: totalPages.toString(),
            active: currentPage === totalPages,
          });
        }
      }

      return visiblePages;
    };

    const paginationItems = [
      { type: "first", label: "First", disabled: currentPage === 1 },
      { type: "prev", label: "Prev", disabled: currentPage === 1 },
      ...getVisiblePages(),
      { type: "next", label: "Next", disabled: currentPage === totalPages },
      { type: "last", label: "Last", disabled: currentPage === totalPages },
    ];

    return (
      <nav
        className={`inline-flex items-start gap-[5.32px] relative flex-[0_0_auto] ${className}`}
        aria-label="Pagination"
      >
        {paginationItems.map((item, index) => {
          if (item.type === "first") {
            return (
              <button
                key={index}
                disabled={item.disabled}
                onClick={() => !item.disabled && onPageChange(1)}
                className="inline-flex flex-col h-[34.07px] items-center justify-center gap-[10.65px] px-[4.26px] py-[10.65px] relative flex-[0_0_auto] bg-white rounded-[8.52px] disabled:cursor-not-allowed"
                aria-label="First page"
                title="First page"
              >
                <span
                  className={`relative w-fit mt-[-4.18px] mb-[-2.05px] [font-family:'Open_Sans-SemiBold',Helvetica] font-semibold text-[13.8px] tracking-[0] leading-[normal] ${
                    item.disabled ? "text-[#cccccc]" : "text-[#333333]"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          if (item.type === "prev") {
            return (
              <button
                key={index}
                disabled={item.disabled}
                onClick={() => !item.disabled && onPageChange(currentPage - 1)}
                className="inline-flex flex-col h-[34.07px] items-center justify-center gap-[10.65px] px-[4.26px] py-[10.65px] relative flex-[0_0_auto] bg-white rounded-[8.52px] disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <span className="relative w-fit mt-[-4.18px] mb-[-2.05px] [font-family:'Open_Sans-SemiBold',Helvetica] font-semibold text-[#cccccc] text-[13.8px] tracking-[0] leading-[normal]">
                  {item.label}
                </span>
              </button>
            );
          }

          if (item.type === "next") {
            return (
              <button
                key={index}
                disabled={item.disabled}
                onClick={() => !item.disabled && onPageChange(currentPage + 1)}
                className="inline-flex flex-col h-[34.07px] items-center justify-center gap-[10.65px] px-[4.26px] py-[10.65px] relative flex-[0_0_auto] bg-white rounded-[8.52px] disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <span className="relative w-fit mt-[-4.18px] mb-[-2.05px] [font-family:'Open_Sans-SemiBold',Helvetica] font-semibold text-[#333333] text-[13.8px] tracking-[0] leading-[normal]">
                  {item.label}
                </span>
              </button>
            );
          }

          if (item.type === "last") {
            return (
              <button
                key={index}
                disabled={item.disabled}
                onClick={() => !item.disabled && onPageChange(totalPages)}
                className="inline-flex flex-col h-[34.07px] items-center justify-center gap-[10.65px] px-[4.26px] py-[10.65px] relative flex-[0_0_auto] bg-white rounded-[8.52px] disabled:cursor-not-allowed"
                aria-label="Last page"
                title="Last page"
              >
                <span
                  className={`relative w-fit mt-[-4.18px] mb-[-2.05px] [font-family:'Open_Sans-SemiBold',Helvetica] font-semibold text-[13.8px] tracking-[0] leading-[normal] ${
                    item.disabled ? "text-[#cccccc]" : "text-[#333333]"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          if (item.type === "ellipsis") {
            return (
              <div
                key={index}
                className="bg-white flex flex-col w-[34.07px] h-[34.07px] items-center justify-center gap-[10.65px] p-[10.65px] relative rounded-[8.52px]"
              >
                <span className="relative w-fit mt-[-4.18px] mb-[-2.05px] [font-family:'Open_Sans-SemiBold',Helvetica] font-semibold text-[#333333] text-[13.8px] tracking-[0] leading-[normal]">
                  {item.label}
                </span>
              </div>
            );
          }

          if (item.type === "page") {
            if (item.active) {
              return (
                <button
                  key={index}
                  className="bg-[#d0fee4] flex flex-col w-[34.07px] h-[34.07px] items-center justify-center gap-[10.65px] p-[10.65px] relative rounded-[8.52px]"
                  aria-label={`Page ${item.label}`}
                  aria-current="page"
                  onClick={() => onPageChange(parseInt(item.label))}
                >
                  <span className="relative w-fit mt-[-4.18px] mb-[-2.05px] [font-family:'Open_Sans-SemiBold',Helvetica] font-semibold text-[#333333] text-[13.8px] tracking-[0] leading-[normal]">
                    {item.label}
                  </span>
                </button>
              );
            } else {
              return (
                <button
                  key={index}
                  className={`flex flex-col w-[34.07px] h-[34.07px] items-center justify-center gap-[10.65px] p-[10.65px] relative bg-white rounded-[8.52px] border-[1.06px] border-solid border-[#f1f1f1] ${
                    item.label === totalPages.toString()
                      ? "ml-[-1.61px] mr-[-1.61px]"
                      : ""
                  }`}
                  aria-label={`Page ${item.label}`}
                  onClick={() => onPageChange(parseInt(item.label))}
                >
                  <span className="relative w-fit mt-[-4.18px] mb-[-2.05px] [font-family:'Open_Sans-SemiBold',Helvetica] font-semibold text-[#333333] text-[13.8px] tracking-[0] leading-[normal]">
                    {item.label}
                  </span>
                </button>
              );
            }
          }

          return null;
        })}
      </nav>
    );
  }

  // Default variant (improved user-friendly implementation)
  return (
    <div
      className={`bg-gray-50 rounded-lg border border-gray-200 ${className}`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
        {/* Page Info */}
        <div className="text-sm text-gray-600 font-medium">
          Showing page{" "}
          <span className="text-gray-900 font-semibold">{currentPage}</span> of{" "}
          <span className="text-gray-900 font-semibold">{totalPages}</span>
          {totalItems !== undefined && totalItems !== null && (
            <span className="text-gray-500">
              {" "}
              ({(totalItems || 0).toLocaleString()} total results)
            </span>
          )}
        </div>

        {/* Pagination Controls - Only Previous and Next */}
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`inline-flex px-6 h-10 items-center justify-center rounded-md border border-gray-300 text-sm font-medium transition-all ${
              currentPage === 1
                ? "cursor-not-allowed text-gray-400 bg-gray-100 border-gray-200"
                : "cursor-pointer hover:bg-white hover:border-gray-400 hover:shadow-md text-gray-700 bg-white shadow-sm"
            }`}
            aria-label="Previous page"
          >
            Previous
          </button>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`inline-flex px-6 h-10 items-center justify-center rounded-md border border-gray-300 text-sm font-medium transition-all ${
              currentPage === totalPages
                ? "cursor-not-allowed text-gray-400 bg-gray-100 border-gray-200"
                : "cursor-pointer hover:bg-white hover:border-gray-400 hover:shadow-md text-gray-700 bg-white shadow-sm"
            }`}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
