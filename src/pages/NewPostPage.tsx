import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type NewPostPageProps = {
  userId: string;
};

export default function NewPostPage({ userId }: NewPostPageProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        user_id: userId,
      })
      .select('id')
      .single();

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    navigate(`/posts/${data.id}`);
  };

  return (
    <section className="panel">
      <div className="page-title-wrap">
        <h1 className="page-title">게시글 작성</h1>
        <p className="page-subtitle">제목과 내용을 입력한 뒤 게시글을 발행하세요.</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <label>
          제목
          <input
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label>
          내용
          <textarea
            required
            rows={8}
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
        </label>

        <div className="row-buttons">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? '저장 중...' : '게시글 발행'}
          </button>
          <Link to="/" className="btn btn-secondary">
            취소
          </Link>
        </div>
      </form>

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
    </section>
  );
}
