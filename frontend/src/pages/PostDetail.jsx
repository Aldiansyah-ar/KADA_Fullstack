import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Spin, Divider, Button, Input, message } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';

const { TextArea } = Input;

const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [postId]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/posts/${postId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      const data = await response.json();
      setPost(data);
    } catch (error) {
      console.error("Error loading post:", error);
      message.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/posts/${postId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error loading comments:", error);
      message.error('Failed to load comments');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleEdit = () => {
    setEditTitle(post.title);
    setEditContent(post.content);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:3000/posts/${post._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      const updatedPost = await response.json();
      setPost(updatedPost);
      setIsEditing(false);
      message.success('Post updated successfully!');
    } catch (error) {
      console.error("Error updating post:", error);
      message.error('Failed to update post');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setAddingComment(true);
    try {
      const response = await fetch(`http://localhost:3000/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          author: 'Anonymous' // Ubah ini jika ada sistem login
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const addedComment = await response.json();
      setComments(prev => [...prev, addedComment]);
      setNewComment('');
      message.success('Comment added!');
    } catch (error) {
      console.error("Error adding comment:", error);
      message.error('Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Link to="/posts">Back to Posts</Link>

      {loading ? (
        <Spin size="large" style={{ display: 'block', marginTop: 50 }} />
      ) : post ? (
        <Card
          title="Post Details"
          bordered={false}
          style={{ marginTop: 20 }}
          extra={!isEditing && (
            <Button type="primary" onClick={handleEdit}>
              Edit
            </Button>
          )}
        >
          {isEditing ? (
            <>
              <Input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                placeholder="Title"
                style={{ marginBottom: 10 }}
              />
              <TextArea
                rows={4}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                placeholder="Content"
                style={{ marginBottom: 10 }}
              />
              <div>
                <Button type="primary" onClick={handleSave} style={{ marginRight: 8 }}>
                  Save
                </Button>
                <Button onClick={handleCancel}>Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <h2>{post.title}</h2>
              <p>{post.content}</p>
              {post.createdAt && (
                <p style={{ color: 'gray', fontSize: '0.8em' }}>
                  Created: {new Date(post.createdAt).toLocaleString()}
                </p>
              )}
              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <p style={{ color: 'gray', fontSize: '0.8em' }}>
                  Last updated: {new Date(post.updatedAt).toLocaleString()}
                </p>
              )}
            </>
          )}
        </Card>
      ) : (
        <p>Post not found</p>
      )}

      <Divider>Comments</Divider>

      {commentsLoading ? (
        <Spin />
      ) : comments.length > 0 ? (
        comments.map(comment => (
          <Card
            key={comment._id}
            type="inner"
            style={{ marginBottom: 15 }}
            extra={comment.createdAt && (
              <span>Created at: {new Date(comment.createdAt).toLocaleString()}</span>
            )}
          >
            <p>{comment.content}</p>
            {comment.author && (
              <p style={{ color: 'gray', fontSize: '0.8em' }}>
                By: {comment.author}
              </p>
            )}
          </Card>
        ))
      ) : (
        <p>No comments available.</p>
      )}

      <Divider>Add a Comment</Divider>
      <TextArea
        rows={3}
        value={newComment}
        onChange={e => setNewComment(e.target.value)}
        placeholder="Write your comment here..."
        style={{ marginBottom: 10 }}
      />
      <Button
        type="primary"
        onClick={handleAddComment}
        loading={addingComment}
        disabled={!newComment.trim()}
      >
        Submit Comment
      </Button>
    </div>
  );
};

export default PostDetail;