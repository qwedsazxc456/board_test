import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Comment, Post } from '../types';

type PostDetailPageProps = {
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

type CommentRow = {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile: { id: string; nickname: string }[] | null;
};

export default function PostDetailPage({ userId }: PostDetailPageProps) {
  const params = useParams();
  const navigate = useNavigate();
  const postId = Number(params.postId);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [isEditingPost, setIsEditingPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');

  const [newComment, setNewComment] = useState('');
  const [commentActionError, setCommentActionError] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');

  const loadDetail = async () => {
    if (Number.isNaN(postId)) {
      setErrorMessage('잘못된 게시글 주소입니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const [{ data: postData, error: postError }, { data: commentData, error: commentError }] =
      await Promise.all([
        supabase
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
          .eq('id', postId)
          .single(),
        supabase
          .from('comments')
          .select(
            `
              id,
              post_id,
              user_id,
              content,
              created_at,
              updated_at,
              profile:profiles!comments_user_id_fkey(id, nickname)
            `,
          )
          .eq('post_id', postId)
          .order('created_at', { ascending: true }),
      ]);

    if (postError) {
      setErrorMessage(postError.message);
      setLoading(false);
      return;
    }

    if (commentError) {
      setErrorMessage(commentError.message);
      setLoading(false);
      return;
    }

    const rowPost = postData as PostRow;
    const mappedPost: Post = {
      ...rowPost,
      profile:
        rowPost.profile && rowPost.profile.length > 0
          ? { id: rowPost.profile[0].id, nickname: rowPost.profile[0].nickname }
          : null,
    };

    const mappedComments: Comment[] = ((commentData ?? []) as CommentRow[]).map((comment) => ({
      ...comment,
      profile:
        comment.profile && comment.profile.length > 0
          ? { id: comment.profile[0].id, nickname: comment.profile[0].nickname }
          : null,
    }));

    setPost(mappedPost);
    setComments(mappedComments);
    setPostTitle(mappedPost.title);
    setPostContent(mappedPost.content);
    setLoading(false);
  };

  useEffect(() => {
    loadDetail();
  }, [postId]);

  const handlePostUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!post) {
      return;
    }

    setErrorMessage('');

    const { error } = await supabase
      .from('posts')
      .update({ title: postTitle, content: postContent })
      .eq('id', post.id)
      .eq('user_id', userId || '');

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setIsEditingPost(false);
    await loadDetail();
  };

  const handlePostDelete = async () => {
    if (!post) {
      return;
    }

    const confirmed = window.confirm('게시글을 삭제하시겠습니까?');
    if (!confirmed) {
      return;
    }

    setErrorMessage('');

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.id)
      .eq('user_id', userId || '');

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    navigate('/');
  };

  const handleCommentCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) {
      setCommentActionError('댓글 작성은 로그인 후 가능합니다.');
      return;
    }

    setCommentActionError('');

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: userId,
      content: newComment,
    });

    if (error) {
      setCommentActionError(error.message);
      return;
    }

    setNewComment('');
    await loadDetail();
  };

  const startCommentEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
    setCommentActionError('');
  };

  const handleCommentUpdate = async (commentId: number) => {
    setCommentActionError('');

    const { error } = await supabase
      .from('comments')
      .update({ content: editingCommentContent })
      .eq('id', commentId)
      .eq('post_id', postId)
      .eq('user_id', userId || '');

    if (error) {
      setCommentActionError(error.message);
      return;
    }

    setEditingCommentId(null);
    setEditingCommentContent('');
    await loadDetail();
  };

  const handleCommentDelete = async (commentId: number) => {
    const confirmed = window.confirm('댓글을 삭제하시겠습니까?');
    if (!confirmed) {
      return;
    }

    setCommentActionError('');

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('post_id', postId)
      .eq('user_id', userId || '');

    if (error) {
      setCommentActionError(error.message);
      return;
    }

    await loadDetail();
  };

  if (loading) {
    return <section className="panel">게시글을 불러오는 중입니다...</section>;
  }

  if (errorMessage) {
    return (
      <section className="panel">
        <p className="error-text">{errorMessage}</p>
        <Link to="/" className="link-text">
          목록으로 이동
        </Link>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="panel">
        <p className="empty-text">게시글을 찾을 수 없습니다.</p>
        <Link to="/" className="link-text">
          목록으로 이동
        </Link>
      </section>
    );
  }

  const isPostOwner = userId === post.user_id;

  return (
    <section className="panel">
      <div className="row-buttons" style={{ marginTop: 0, marginBottom: '14px' }}>
        <Link to="/" className="btn btn-secondary">
          목록으로
        </Link>
      </div>

      {isEditingPost ? (
        <form onSubmit={handlePostUpdate} className="form">
          <label>
            제목
            <input
              type="text"
              required
              value={postTitle}
              onChange={(event) => setPostTitle(event.target.value)}
            />
          </label>

          <label>
            내용
            <textarea
              required
              rows={8}
              value={postContent}
              onChange={(event) => setPostContent(event.target.value)}
            />
          </label>

          <div className="row-buttons">
            <button type="submit" className="btn btn-primary">
              수정 저장
            </button>
            <button type="button" onClick={() => setIsEditingPost(false)} className="btn btn-secondary">
              취소
            </button>
          </div>
        </form>
      ) : (
        <>
          <h1 className="page-title" style={{ fontSize: '2rem' }}>
            {post.title}
          </h1>
          <p className="meta-text">
            작성자: {post.profile?.nickname ?? '알 수 없음'} | 작성일:{' '}
            {new Date(post.created_at).toLocaleString()}
          </p>
          <p className="post-content">{post.content}</p>

          {isPostOwner ? (
            <div className="row-buttons">
              <button type="button" onClick={() => setIsEditingPost(true)} className="btn btn-secondary">
                게시글 수정
              </button>
              <button type="button" onClick={handlePostDelete} className="btn btn-danger">
                게시글 삭제
              </button>
            </div>
          ) : null}
        </>
      )}

      <hr className="card-divider" />

      <h3 className="comments-title">댓글 {comments.length}개</h3>
      <ul className="list">
        {comments.map((comment) => {
          const isCommentOwner = userId === comment.user_id;
          const isEditingThis = editingCommentId === comment.id;

          return (
            <li key={comment.id} className="list-item">
              <p className="meta-text">
                {comment.profile?.nickname ?? '알 수 없음'} | {new Date(comment.created_at).toLocaleString()}
              </p>

              {isEditingThis ? (
                <>
                  <textarea
                    rows={3}
                    value={editingCommentContent}
                    onChange={(event) => setEditingCommentContent(event.target.value)}
                  />
                  <div className="row-buttons">
                    <button
                      type="button"
                      onClick={() => handleCommentUpdate(comment.id)}
                      className="btn btn-primary"
                    >
                      댓글 수정 저장
                    </button>
                    <button type="button" onClick={() => setEditingCommentId(null)} className="btn btn-secondary">
                      취소
                    </button>
                  </div>
                </>
              ) : (
                <p className="comment-content">{comment.content}</p>
              )}

              {isCommentOwner && !isEditingThis ? (
                <div className="row-buttons">
                  <button type="button" onClick={() => startCommentEdit(comment)} className="btn btn-secondary">
                    댓글 수정
                  </button>
                  <button type="button" onClick={() => handleCommentDelete(comment.id)} className="btn btn-danger">
                    댓글 삭제
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {userId ? (
        <form onSubmit={handleCommentCreate} className="form">
          <label>
            댓글 작성
            <textarea
              required
              rows={4}
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
            />
          </label>
          <button type="submit" className="btn btn-primary">
            댓글 등록
          </button>
        </form>
      ) : (
        <p className="meta-text">
          댓글 작성은{' '}
          <Link to="/login" className="link-text">
            로그인
          </Link>{' '}
          후 가능합니다.
        </p>
      )}

      {commentActionError ? <p className="error-text">{commentActionError}</p> : null}
    </section>
  );
}
