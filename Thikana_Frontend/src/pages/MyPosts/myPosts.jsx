import { useCallback, useEffect, useState } from 'react';
import { HiOutlineTrash } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PropertyCard from '../../components/PropertyCard/propertyCard';
import Loader from '../../components/Loader/loader';
import { toCardProperty } from '../../utils/propertyDisplay';
import './myPosts.scss';

export default function MyPosts() {
  const { apiUrl, authenticatedFetch } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [updatingPostId, setUpdatingPostId] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch(`${apiUrl}/post/user-posts`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load your posts');
      }

      setPosts(data.posts || []);
    } catch (err) {
      setMessage(err.message || 'Could not load your posts. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, authenticatedFetch]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handlePostTypeChange = async (postId, newPostType) => {
    setUpdatingPostId(postId);
    setMessage('');

    try {
      const response = await authenticatedFetch(`${apiUrl}/post/update-post/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postType: newPostType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update post type');
      }

      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.post_id === postId ? { ...p, post_type: newPostType } : p))
      );
      setMessage(`Post updated: Now listed for ${newPostType}`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUpdatingPostId(null);
    }
  };

  const handleDeletePost = async (post) => {
    if (
      !window.confirm(
        `Delete post for "${post.title}"? The property itself will NOT be deleted.`
      )
    ) {
      return;
    }

    setDeletingPostId(post.post_id);
    setMessage('');

    try {
      const response = await authenticatedFetch(
        `${apiUrl}/post/delete-post/${post.post_id}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete post');
      }

      setPosts((prevPosts) => prevPosts.filter((p) => p.post_id !== post.post_id));
      setMessage(result.message || 'Post deleted successfully');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setDeletingPostId(null);
    }
  };

  return (
    <div className="page posts-page">
      <div className="posts-page__header">
        <div style={{ marginBottom: '15px' }}>
          <p className="eyebrow">Your active listings</p>
          <h1>My Posts</h1>
          <p>View your public posts, update listing types, or unpost listings.</p>
        </div>

        <Link className="button" to="/app/my-properties">
          Manage Properties
        </Link>
      </div>

      {message && <p className="notice">{message}</p>}

      {loading ? (
        <Loader width="100%" height="300px" text="Loading your posts" />
      ) : posts.length ? (
        <div className="property-grid my-property-grid" style={{ marginTop: '30px' }}>
          {posts.map((post) => (
            <PropertyCard
              key={post.post_id}
              property={toCardProperty(post)}
              primaryAction={
                <div className="property-card__post-type-selector">
                  <span>Posted for</span>
                  <select
                    value={post.post_type}
                    disabled={updatingPostId === post.post_id}
                    onChange={(e) => handlePostTypeChange(post.post_id, e.target.value)}
                  >
                    <option value="rent">Rent</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
              }
              detailsInActions={true}
              actions={
                <button
                  onClick={() => handleDeletePost(post)}
                  title={`Delete post for ${post.title}`}
                  disabled={deletingPostId === post.post_id}
                >
                  <HiOutlineTrash />
                  {deletingPostId === post.post_id ? 'Deleting...' : 'Delete'}
                </button>
              }
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No posts yet</h2>
          <p>
            You haven't posted any properties yet. Go to My Properties to publish one for rent or
            sale.
          </p>
          <Link className="button" to="/app/my-properties">
            Go to My Properties
          </Link>
        </div>
      )}
    </div>
  );
}
