"use client";

import { useState } from "react";
import FeedPage from "./components/FeedPage";
import WritePage from "./components/WritePage";
import BottomNavigation from "./components/BottomNavigation";
import ErrorBoundary from "./components/ErrorBoundary";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"feed" | "write">("feed");

  const handleTabChange = (tab: "feed" | "write") => {
    try {
      setActiveTab(tab);
    } catch (error) {
      console.error("Tab change error:", error);
    }
  };

  return (
    <ErrorBoundary>
      <div className="relative">
        {/* 메인 콘텐츠 */}
        <ErrorBoundary>
          {activeTab === "feed" ? <FeedPage /> : <WritePage />}
        </ErrorBoundary>

        {/* 하단 네비게이션 */}
        <ErrorBoundary>
          <BottomNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}
