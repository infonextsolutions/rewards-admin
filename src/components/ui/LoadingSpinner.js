export default function LoadingSpinner({
  message = "Loading...",
  size = "medium",
  fullHeight = false
}) {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-12 w-12",
    large: "h-16 w-16"
  };

  const containerClasses = fullHeight
    ? "min-h-[400px] flex items-center justify-center"
    : "py-12";

  return (
    <div className={`bg-white rounded-[10px] border border-gray-200 w-full ${containerClasses}`}>
      <div className="flex flex-col items-center justify-center gap-4">
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
        {message && <p className="text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
