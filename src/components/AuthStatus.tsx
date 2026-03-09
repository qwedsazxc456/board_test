import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type AuthStatusProps = {
  userEmail: string | null;
};

export default function AuthStatus({ userEmail }: AuthStatusProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!userEmail) {
    return (
      <div className="auth-status">
        <Link to="/login" className="btn btn-secondary">
          로그인
        </Link>
        <Link to="/signup" className="btn btn-primary">
          회원가입
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-status">
      <span className="auth-email">{userEmail}</span>
      <button onClick={handleLogout} type="button" className="btn btn-secondary">
        로그아웃
      </button>
    </div>
  );
}
