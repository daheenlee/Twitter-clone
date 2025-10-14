"use client";

interface BottomNavigationProps {
  activeTab: "feed" | "write";
  onTabChange: (tab: "feed" | "write") => void;
}

export default function BottomNavigation({
  activeTab,
  onTabChange,
}: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-md mx-auto flex">
        {/* 글보기 탭 */}
        <button
          onClick={() => onTabChange("feed")}
          className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
            activeTab === "feed" ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <svg
            className="w-6 h-6 mb-1"
            fill={activeTab === "feed" ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                activeTab === "feed"
                  ? "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  : "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              }
            />
          </svg>
          <span className="text-xs font-medium">글보기</span>
        </button>

        {/* 글쓰기 탭 */}
        <button
          onClick={() => onTabChange("write")}
          className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
            activeTab === "write" ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <svg
            className="w-6 h-6 mb-1"
            fill={activeTab === "write" ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                activeTab === "write"
                  ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  : "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              }
            />
          </svg>
          <span className="text-xs font-medium">글쓰기</span>
        </button>
      </div>
    </div>
  );
}
