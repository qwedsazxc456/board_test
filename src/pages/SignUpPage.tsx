import { FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type SignUpPageProps = {
  userId: string | null;
};

export default function SignUpPage({ userId }: SignUpPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (userId) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMessage('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        nickname,
      });

      if (profileError) {
        setErrorMessage(profileError.message);
        setLoading(false);
        return;
      }
    }

    setMessage('회원가입이 완료되었습니다. 이메일 인증이 켜져 있다면 인증 후 로그인해 주세요.');
    setEmail('');
    setPassword('');
    setNickname('');
    setLoading(false);
  };

  return (
    <section className="panel auth-panel">
      <div className="page-title-wrap">
        <h1 className="page-title">새 계정 만들기</h1>
        <p className="page-subtitle">커뮤니티 참여를 위해 기본 정보를 입력하세요.</p>
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
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <label>
          닉네임
          <input
            type="text"
            required
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
          />
        </label>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? '가입 처리 중...' : '회원가입'}
        </button>
      </form>

      {message ? <p className="success-text">{message}</p> : null}
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

      <p className="meta-text">
        이미 계정이 있나요?{' '}
        <Link to="/login" className="link-text">
          로그인
        </Link>
      </p>
    </section>
  );
}
