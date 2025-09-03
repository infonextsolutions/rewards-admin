export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  className = "",
  variant = "default"
}) {
  if (variant === "compact") {
    const paginationItems = [
      { type: "prev", label: "Prev", disabled: currentPage === 1 },
      { type: "page", label: "1", active: currentPage === 1 },
      { type: "page", label: "2", active: currentPage === 2 },
      { type: "page", label: "3", active: currentPage === 3 },
      { type: "ellipsis", label: "...", active: false },
      { type: "page", label: totalPages.toString(), active: currentPage === totalPages },
      { type: "next", label: "Next", disabled: currentPage === totalPages },
    ];

    return (
      <nav
        className={`inline-flex items-start gap-[5.32px] relative flex-[0_0_auto] ${className}`}
        aria-label="Pagination"
      >
        {paginationItems.map((item, index) => {
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
                  className={`flex flex-col w-[34.07px] h-[34.07px] items-center justify-center gap-[10.65px] p-[10.65px] relative bg-white rounded-[8.52px] border-[1.06px] border-solid border-[#f1f1f1] ${item.label === totalPages.toString() ? "ml-[-1.61px] mr-[-1.61px]" : ""}`}
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

  // Default variant (existing implementation)
  return (
    <div className={`flex justify-between items-center p-6 border-t border-gray-200 ${className}`}>
      <div className="text-sm text-gray-600">
        Page {currentPage} of {totalPages} ({totalItems} total results)
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`inline-flex px-4 py-2 items-center justify-center rounded-lg border border-gray-200 text-sm font-medium transition-colors ${
            currentPage === 1 
              ? "cursor-not-allowed text-gray-400 bg-gray-50" 
              : "cursor-pointer hover:bg-gray-50 text-gray-700"
          }`}
        >
          Previous
        </button>
        
        {/* Page numbers */}
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }
          
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`flex w-9 h-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                currentPage === pageNum
                  ? "bg-[#d0fee4] text-[#333333] border border-green-300"
                  : "bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[#333333]"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        
        {totalPages > 5 && currentPage < totalPages - 2 && (
          <>
            <div className="flex w-9 h-9 items-center justify-center text-sm text-gray-400">
              ...
            </div>
            <button
              onClick={() => onPageChange(totalPages)}
              className="flex w-9 h-9 items-center justify-center rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium text-[#333333] transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`inline-flex px-4 py-2 items-center justify-center rounded-lg border border-gray-200 text-sm font-medium transition-colors ${
            currentPage === totalPages 
              ? "cursor-not-allowed text-gray-400 bg-gray-50" 
              : "cursor-pointer hover:bg-gray-50 text-gray-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}