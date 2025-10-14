"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";

export default function WritePage() {
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !nickname.trim()) {
      alert("닉네임과 내용을 모두 입력해주세요!");
      return;
    }

    setIsPosting(true);

    try {
      const { data, error } = await supabase
        .from("posts")
        .insert([
          {
            content,
            author: nickname,
            profile_image_url: profileImage || null,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      console.log("포스트 작성:", data);
      setNickname("");
      setContent("");
      setProfileImage("");
      alert("포스트가 작성되었습니다!");
    } catch (error) {
      console.error("포스트 작성 오류:", error);
      alert("포스트 작성 중 오류가 발생했습니다.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">글쓰기</h1>
      </div>

      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로필 이미지
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="프로필"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-2xl">📷</span>
                )}
              </div>
              <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                이미지 선택
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="무슨 일이 일어나고 있나요?"
              className="w-full min-h-[120px] p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              maxLength={280}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">{content.length}/280</div>

            <button
              type="submit"
              disabled={!content.trim() || !nickname.trim() || isPosting}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors ${
                content.trim() && nickname.trim() && !isPosting
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isPosting ? "작성 중..." : "포스트"}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 text-sm">팁</h3>
              <p className="text-blue-700 text-sm mt-1">
                닉네임, 프로필 이미지, 내용을 모두 작성하고 포스트하세요!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
