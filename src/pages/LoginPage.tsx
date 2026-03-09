import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type LoginPageProps = {
  userId: string | null;
};

export default function LoginPage({ userId }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  if (userId) {
    return <Navigate to="/" replace />;
  }

  const from = (location.state as { from?: string } | null)?.from;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    navigate(from || '/', { replace: true });
  };

  return (
    <section className="panel auth-panel">
      <div className="page-title-wrap">
        <h1 className="page-title">다시 만나서 반가워요</h1>
        <p className="page-subtitle">이메일과 비밀번호를 입력해 로그인하세요.</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <label>
          이메일
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          비밀번호
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

      <p className="meta-text">
        계정이 없나요?{' '}
        <Link to="/signup" className="link-text">
          회원가입
        </Link>
      </p>
    </section>
  );
}
