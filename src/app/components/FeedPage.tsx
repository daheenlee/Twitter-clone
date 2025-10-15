"use client";

import CommentSection from "../components/CommentSection";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";

interface Comment {
  id: number;
  nickname: string;
  content: string;
  created_at: string;
  profile_image_url?: string;
}

interface SupabasePost {
  id: number;
  content: string;
  author: string;
  created_at: string;
  likes: number;
  profile_image_url?: string;
  comments?: Comment[];
}

interface Post {
  id: number;
  content: string;
  author: string;
  timestamp: string;
  likes: number;
  comments: number;
  profileImage?: string;
  commentList: {
    id: number;
    nickname: string;
    content: string;
    timestamp: string;
    profileImage?: string;
  }[];
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ 댓글 등록 함수 (Supabase 저장 + 즉시 반영)
  const handleAddComment = async (
    postId: number,
    nickname: string,
    content: string
  ) => {
    try {
      // Supabase에 댓글 추가
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          nickname,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // 새 댓글을 프론트에 즉시 반영
      const newComment = {
        id: data.id,
        nickname: data.nickname,
        content: data.content,
        timestamp: data.created_at,
        profileImage: data.profile_image_url || undefined,
      };

      // posts 상태 업데이트
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments + 1,
                commentList: [...post.commentList, newComment],
              }
            : post
        )
      );
    } catch (err) {
      console.error("댓글 추가 실패:", err);
    }
  };

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      console.log("🔵 fetchPosts 시작!");

      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          id,
          content,
          author,
          created_at,
          likes,
          profile_image_url,
          comments:comments (
            id,
            nickname,
            content,
            created_at,
            profile_image_url
          )
        `
        )
        .order("created_at", { ascending: false });

      console.log("🟢 Supabase 응답:", { data, error });

      if (error) {
        console.error("🔴 에러 발생:", error);
        setLoading(false);
        return;
      }

      if (data) {
        const transformedData: Post[] = (data as SupabasePost[]).map(
          (post) => ({
            id: post.id,
            content: post.content,
            author: post.author,
            timestamp: post.created_at,
            likes: post.likes,
            comments: post.comments?.length || 0,
            profileImage: post.profile_image_url,
            commentList:
              post.comments?.map((comment) => ({
                id: comment.id,
                nickname: comment.nickname,
                content: comment.content,
                timestamp: comment.created_at,
                profileImage: comment.profile_image_url,
              })) || [],
          })
        );

        setPosts(transformedData);
      }

      setLoading(false);
    }

    fetchPosts();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  // ✅ 좋아요 기능 그대로 유지
  const handleLike = async (postId: number) => {
    try {
      const currentPost = posts.find((post) => post.id === postId);
      if (!currentPost) return;

      const newLikes = currentPost.likes + 1;

      const { error } = await supabase
        .from("posts")
        .update({ likes: newLikes })
        .eq("id", postId);

      if (error) throw error;

      setPosts(
        posts.map((post) =>
          post.id === postId ? { ...post, likes: newLikes } : post
        )
      );
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">피드</h1>
      </div>

      {/* 포스트 목록 */}
      <div className="pb-20">
        {posts.map((post) => (
          <div key={post.id} className="border-b border-gray-100 p-4">
            {/* 포스트 헤더 */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                {post.profileImage ? (
                  <Image
                    src={post.profileImage}
                    alt={post.author}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover rounded-full"
                    unoptimized
                  />
                ) : (
                  post.author.charAt(0)
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{post.author}</div>
                <div className="text-sm text-gray-500">{post.timestamp}</div>
              </div>
            </div>

            {/* 포스트 내용 */}
            <div className="ml-12 mb-3">
              <p className="text-gray-900 leading-relaxed">{post.content}</p>
            </div>

            {/* 액션 버튼 */}
            <div className="ml-12 flex items-center gap-6">
              <button
                onClick={() => handleLike(post.id)}
                className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
              >
                ❤️ <span className="text-sm">{post.likes}</span>
              </button>

              <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                💬 <span className="text-sm">{post.comments}</span>
              </button>

              <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                🔁
              </button>
            </div>

            {/* 댓글 섹션 */}
            <CommentSection
              postId={post.id}
              comments={post.commentList}
              onAddComment={handleAddComment}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
