const JobCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col justify-between h-full animate-pulse">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-4 w-full">
            <div className="w-12 h-12 bg-gray-200 rounded-xl shrink-0"></div>
            <div className="flex-1 pt-1">
              <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
            </div>
          </div>
          {/* Bookmark Placeholder */}
          <div className="w-6 h-6 bg-gray-200 rounded-md shrink-0 ml-4"></div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
           <div className="h-6 w-20 bg-gray-200 rounded-md"></div>
           <div className="h-6 w-24 bg-gray-200 rounded-md"></div>
           <div className="h-6 w-20 bg-gray-200 rounded-md"></div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="h-4 bg-gray-200 rounded-md w-full"></div>
          <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
        <div className="h-4 bg-gray-200 rounded-md w-16"></div>
        <div className="h-9 bg-gray-200 rounded-lg w-28"></div>
      </div>
    </div>
  );
};

export default JobCardSkeleton;