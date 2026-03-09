import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <h2>게시글 작성</h2>
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

        <button type="submit" disabled={loading}>
          {loading ? '저장 중...' : '작성 완료'}
        </button>
      </form>

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
    </section>
  );
}
