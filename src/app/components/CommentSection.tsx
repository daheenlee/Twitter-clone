"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";

interface Comment {
  id: number;
  nickname: string;
  content: string;
  timestamp: string;
  profileImage?: string;
}

interface CommentSectionProps {
  postId: number;
  comments: Comment[];
  onAddComment?: (postId: number, nickname: string, content: string) => void;
}

export default function CommentSection({
  postId,
  comments,
  onAddComment,
}: CommentSectionProps) {
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) return;

    setIsSubmitting(true);

    try {
      // FeedPage에서 onAddComment 처리
      await onAddComment?.(postId, nickname, content);

      setNickname("");
      setContent("");
      setShowForm(false);
    } catch (err) {
      console.error("댓글 등록 실패:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="mt-4 border-t border-gray-100 pt-3">
      {comments.length > 0 && (
        <div className="mb-4 space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {comment.profileImage ? (
                  <Image
                    src={comment.profileImage}
                    alt={comment.nickname}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  getInitials(comment.nickname)
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-sm">
                    {comment.nickname}
                  </span>
                  <span className="text-xs text-gray-500">
                    {comment.timestamp}
                  </span>
                </div>
                <p className="text-gray-900 text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors text-sm"
        >
          댓글 달기
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              나
            </div>
            <div className="flex-1 space-y-2">
              <input
                type="text"
                placeholder="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={20}
                required
              />
              <textarea
                placeholder="댓글을 입력하세요..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                maxLength={200}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setNickname("");
                setContent("");
              }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!nickname.trim() || !content.trim() || isSubmitting}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                nickname.trim() && content.trim() && !isSubmitting
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "작성 중..." : "댓글 달기"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
