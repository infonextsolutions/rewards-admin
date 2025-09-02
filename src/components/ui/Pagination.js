export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  className = ""
}) {
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