import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import AuthStatus from './components/AuthStatus';
import RequireAuth from './components/RequireAuth';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import PostListPage from './pages/PostListPage';
import NewPostPage from './pages/NewPostPage';
import PostDetailPage from './pages/PostDetailPage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loadingAuth) {
    return <div className="container">인증 상태 확인 중...</div>;
  }

  return (
    <div className="container">
      <header className="header">
        <h1>
          <Link to="/">게시판 MVP</Link>
        </h1>
        <AuthStatus userEmail={user?.email ?? null} />
      </header>

      <Routes>
        <Route path="/" element={<PostListPage userId={user?.id ?? null} />} />
        <Route path="/signup" element={<SignUpPage userId={user?.id ?? null} />} />
        <Route path="/login" element={<LoginPage userId={user?.id ?? null} />} />
        <Route
          path="/posts/new"
          element={
            <RequireAuth userId={user?.id ?? null}>
              <NewPostPage userId={user?.id ?? ''} />
            </RequireAuth>
          }
        />
        <Route path="/posts/:postId" element={<PostDetailPage userId={user?.id ?? null} />} />
      </Routes>
    </div>
  );
}
