"use client";

import CommentSection from "./CommentSection";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

interface Comment {
  id: number;
  nickname: string;
  content: string;
  timestamp: string;
  profileImage?: string;
}

interface Post {
  id: number;
  content: string;
  author: string;
  timestamp: string;
  likes: number;
  comments: number;
  profileImage?: string;
  commentList: Comment[];
}

const mockPosts: Post[] = [
  {
    id: 1,
    content:
      "안녕하세요! 트위터 클론 앱에 오신 것을 환영합니다. 첫 번째 포스트입니다! 🎉",
    author: "관리자",
    timestamp: "2분 전",
    likes: 12,
    comments: 3,
    commentList: [
      {
        id: 1,
        nickname: "사용자A",
        content: "환영합니다! 좋은 앱이네요 👍",
        timestamp: "1분 전",
      },
      {
        id: 2,
        nickname: "사용자B",
        content: "트위터 클론이군요! 재미있을 것 같아요",
        timestamp: "30초 전",
      },
    ],
  },
  {
    id: 2,
    content:
      "모바일에서 사용하기 편한 인터페이스로 만들어보고 있어요. 어떤 기능이 더 필요할까요?",
    author: "개발자",
    timestamp: "15분 전",
    likes: 8,
    comments: 5,
    commentList: [
      {
        id: 3,
        nickname: "개발자2",
        content: "다크모드는 어떨까요?",
        timestamp: "10분 전",
      },
    ],
  },
  {
    id: 3,
    content: "오늘 날씨가 정말 좋네요! 🌤️ 산책하기 딱 좋은 날씨입니다.",
    author: "사용자1",
    timestamp: "1시간 전",
    likes: 25,
    comments: 7,
    commentList: [],
  },
];

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);

      console.log("🔵 fetchPosts 시작!"); // 추가!

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

      console.log("🟢 Supabase 응답:", { data, error }); // 추가!

      if (error) {
        console.error("🔴 에러 발생:", error);
        setLoading(false);
        return;
      }

      if (data) {
        console.log("🟡 받아온 데이터:", data); // 추가!

        const transformedData = data.map((post: any) => ({
          id: post.id,
          content: post.content,
          author: post.author,
          timestamp: post.created_at,
          likes: post.likes,
          comments: post.comments?.length || 0,
          profileImage: post.profile_image_url,
          commentList: (post.comments || []).map((comment: any) => ({
            id: comment.id,
            nickname: comment.nickname,
            content: comment.content,
            timestamp: comment.created_at,
            profileImage: comment.profile_image_url,
          })),
        }));

        console.log("🟣 변환된 데이터:", transformedData); // 추가!
        setPosts(transformedData);
      }

      setLoading(false);
    }

    fetchPosts();
  }, []);

  if (loading) return <div>Loading...</div>;

  const handleLike = (postId: number) => {
    try {
      setPosts(
        posts.map((post) =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
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
      const newComment: Comment = {
        id: Date.now(),
        nickname,
        content,
        timestamp: "방금 전",
      };

      setPosts(
        posts.map((post) =>
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
                  <img
                    src={post.profileImage}
                    alt={post.author}
                    className="w-full h-full object-cover"
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

            {/* 포스트 액션 버튼 */}
            <div className="ml-12 flex items-center gap-6">
              <button
                onClick={() => handleLike(post.id)}
                className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="text-sm">{post.likes}</span>
              </button>

              <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="text-sm">{post.comments}</span>
              </button>

              <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
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
} // ← 이 괄호로 컴포넌트 끝!
