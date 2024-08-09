// components/Forum.js
import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../misc/firebase';

export default function Forum() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPost.trim()) {
      await addDoc(collection(db, 'posts'), {
        content: newPost,
        createdAt: new Date(),
        // Add user info here when authentication is implemented
      });
      setNewPost('');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your thoughts..."
        />
        <button type="submit">Post</button>
      </form>
      <div>
        {posts.map(post => (
          <div key={post.id}>
            <p>{post.content}</p>
            {/* Add more post details here */}
          </div>
        ))}
      </div>
    </div>
  );
}