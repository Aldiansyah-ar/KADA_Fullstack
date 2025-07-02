import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Spin, Divider, Button, Input, message } from 'antd';

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

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [postId]);

  const fetchPost = () => {
    setLoading(true);
    fetch(`http://localhost:3000/posts/${postId}`)
      .then(res => res.json())
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error loading post:", error);
        setLoading(false);
      });
  };

  const fetchComments = () => {
    setCommentsLoading(true);
    fetch(`http://localhost:3000/posts/${postId}/comments`)
      .then(res => res.json())
      .then(data => {
        setComments(data);
        setCommentsLoading(false);
      })
      .catch(error => {
        console.error("Error loading comments:", error);
        setCommentsLoading(false);
      });
  };

  const handleEdit = () => {
    setEditTitle(post.title);
    setEditContent(post.content);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    const updatedPost = {
      ...post,
      title: editTitle,
      content: editContent,
    };

    // Update ke backend
    fetch(`http://localhost:3000/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedPost),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to update post');
        }
        return res.json();
      })
      .then(data => {
        setPost(data);
        setIsEditing(false);
        message.success('Post updated successfully!');
      })
      .catch(error => {
        console.error("Error updating post:", error);
        message.error('Failed to update post');
      });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Link to="/posts">Back to Posts</Link>

      {loading ? (
        <Spin size="large" style={{ display: 'block', marginTop: 50 }} />
      ) : (
        post && (
          <Card
            title={`Post #${postId}`}
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
              </>
            )}
          </Card>

        )
      )}

      <Divider>Comments</Divider>

      {commentsLoading ? (
        <Spin />
      ) : (
        comments.length > 0 ? (
          comments.map(comment => (
            <Card
              key={comment.id}
              type="inner"
              title={`Comment #${comment.id}`}
              style={{ marginBottom: 15 }}
            >
              <p>{comment.content}</p>
            </Card>
          ))
        ) : (
          <p>No comments available.</p>
        )
      )}
    </div>
  );
};

export default PostDetail;

