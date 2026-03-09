import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Post } from '../types';

type PostListPageProps = {
  userId: string | null;
};

type PostRow = {
  id: number;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile: { id: string; nickname: string }[] | null;
};

export default function PostListPage({ userId }: PostListPageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadPosts = async () => {
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase
      .from('posts')
      .select(
        `
          id,
          user_id,
          title,
          content,
          created_at,
          updated_at,
          profile:profiles!posts_user_id_fkey(id, nickname)
        `,
      )
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    const mapped = ((data ?? []) as PostRow[]).map((post) => ({
      ...post,
      profile:
        post.profile && post.profile.length > 0
          ? { id: post.profile[0].id, nickname: post.profile[0].nickname }
          : null,
    }));

    setPosts(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <section>
      <div className="page-title-wrap">
        <h1 className="page-title">최근 게시글</h1>
        <p className="page-subtitle">커뮤니티 소식을 확인하고 이야기를 남겨보세요.</p>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="section-title">전체 게시글</h2>
          {userId ? (
            <Link to="/posts/new" className="btn btn-primary">
              새 글 작성
            </Link>
          ) : null}
        </div>

        {loading ? <p className="empty-text">게시글을 불러오는 중입니다...</p> : null}
        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

        {!loading && posts.length === 0 ? <p className="empty-text">아직 게시글이 없습니다.</p> : null}

        <ul className="list">
          {posts.map((post) => (
            <li key={post.id} className="list-item post-item">
              <div className="post-info">
                <Link to={`/posts/${post.id}`}>
                  <h3 className="post-title">{post.title}</h3>
                </Link>
                <p className="meta-text">
                  작성자: {post.profile?.nickname ?? '알 수 없음'} | 작성일:{' '}
                  {new Date(post.created_at).toLocaleString()}
                </p>
              </div>
              <Link to={`/posts/${post.id}`} className="btn btn-secondary">
                보기
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
