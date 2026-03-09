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
    return <div className="container">인증 상태를 확인하고 있습니다...</div>;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand-link">
            <span>커뮤니티 게시판</span>
          </Link>
          <AuthStatus userEmail={user?.email ?? null} />
        </div>
      </header>

      <main className="container">
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
      </main>
    </div>
  );
}
