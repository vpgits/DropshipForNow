// pages/index.js
"use client"
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './misc/firebase';
import Forum from './Components/Forum';
import Auth from './Components/Auth';

export default function Home() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Entrepreneurship Community</h1>
      {user ? (
        <>
          <p>Welcome, {user.displayName || user.email}!</p>
          <button onClick={() => auth.signOut()}>Sign Out</button>
          <Forum />
        </>
      ) : (
        <Auth />
      )}
    </div>
  );
}