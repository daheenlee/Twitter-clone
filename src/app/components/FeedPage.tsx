"use client";

import CommentSection from "./CommentSection";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";

// 🟢 댓글 타입
interface Comment {
  id: number;
  nickname: string;
  content: string;
  created_at: string;
  profile_image_url?: string;
}

// 🟢 Supabase에서 posts 테이블 + comments 테이블 join 시 반환될 구조
interface SupabasePost {
  id: number;
  content: string;
  author: string;
  created_at: string;
  likes: number;
  profile_image_url?: string;
  comments?: Comment[];
}

// 🟢 실제 화면에서 사용할 타입
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
        console.log("🟡 받아온 데이터:", data);

        // 🟢 타입 안전하게 변환
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

        console.log("🟣 변환된 데이터:", transformedData);
        setPosts(transformedData);
      }

      setLoading(false);
    }

    fetchPosts();
  }, []);

  if (loading) return <div>Loading...</div>;

const handleLike = async (postId: number) => {
  try {
    // 현재 게시글 찾기
    const currentPost = posts.find(post => post.id === postId);
    if (!currentPost) return;

    const newLikes = currentPost.likes + 1;

    // Supabase 업데이트
    const { error } = await supabase
      .from("posts")
      .update({ likes: newLikes })
      .eq("id", postId);

    if (error) {
      console.error("좋아요 업데이트 실패:", error);
      return;
    }

    // 화면 업데이트
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: newLikes } : post
      )
    );
  } catch (error) {
    console.error("Like error:", error);
  }
};
  const handleAddComment = (
    postId: number,
    nickname: string,
    content: string
  ) => {
    try {
      const newComment = {
        id: Date.now(),
        nickname,
        content,
        timestamp: "방금 전",
      };

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
    } catch (error) {
      console.error("Add comment error:", error);
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
