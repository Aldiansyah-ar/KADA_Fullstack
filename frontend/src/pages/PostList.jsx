import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Typography, Layout, Spin, Button, Input, message, List, Space, Modal, Form } from 'antd';

const { Title } = Typography;
const { Content } = Layout;
const { Search } = Input;

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [counter, setCounter] = useState(1000);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetch(`http://localhost:3000/posts`)
            .then(res => res.json())
            .then(data => {
                setPosts(data);
                setFilteredPosts(data);
                setLoading(false);
            })
            .catch(() => {
                message.error("Failed to fetch posts");
                setLoading(false);
            });
    }, []);

    const showAddModal = () => {
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleAddPost = () => {
        form.validateFields()
            .then(values => {
                const newPost = {
                    id: counter,
                    title: values.title,
                    content: values.content,
                };

                fetch(`http://localhost:3000/posts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newPost),
                })
                    .then(res => {
                        if (!res.ok) {
                            throw new Error('Failed to add post');
                        }
                        return res.json();
                    })
                    .then(data => {
                        const newPosts = [data, ...posts];
                        setPosts(newPosts);
                        filterPosts(newPosts, searchText);
                        setCounter(counter + 1);
                        setIsModalVisible(false);
                        message.success("Post added to server");
                    })
                    .catch(() => {
                        message.error("Failed to add post to server");
                    });
            })
            .catch(() => {
                message.error("Please fill in the form correctly");
            });
    };

    const handleDeletePost = (id) => {
        fetch(`http://localhost:3000/posts/${id}`, {
            method: 'DELETE',
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to delete post');
                }
                const newPosts = posts.filter(post => post.id !== id);
                setPosts(newPosts);
                filterPosts(newPosts, searchText);
                message.success("Post deleted from server");
            })
            .catch(() => {
                message.error("Failed to delete post from server");
            });
    };

    const handleSearch = (value) => {
        setSearchText(value);
        filterPosts(posts, value);
    };

    const filterPosts = (allPosts, text) => {
        const filtered = allPosts.filter(post =>
            post.title.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredPosts(filtered);
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Content style={{ padding: '40px' }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>
                    Posts
                </Title>

                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <Button type="primary" onClick={showAddModal} style={{ marginRight: '10px' }}>
                        Add Post
                    </Button>
                    <Search
                        placeholder="Search posts..."
                        allowClear
                        onSearch={handleSearch}
                        style={{ width: 300 }}
                    />
                </div>

                {loading ? (
                    <Spin size="large" style={{ display: 'block', margin: 'auto' }} />
                ) : (
                    <List
                        dataSource={filteredPosts}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: false,
                            style: { textAlign: 'center', marginTop: '20px' },
                        }}
                        renderItem={post => (
                            <List.Item
                                key={post.id}
                                style={{
                                    background: '#fff',
                                    marginBottom: '16px',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                }}
                            >
                                <List.Item.Meta
                                    title={
                                        <Space>
                                            <span>#{post.id}</span>
                                            <Link to={`/posts/${post.id}`}>{post.title}</Link>
                                        </Space>
                                    }
                                    description={post.content}
                                />
                                <Space>
                                    <Link to={`/posts/${post.id}`}>
                                        <Button type="link">View</Button>
                                    </Link>
                                    <Button
                                        danger
                                        size="small"
                                        onClick={() => handleDeletePost(post.id)}
                                    >
                                        Delete
                                    </Button>
                                </Space>
                            </List.Item>
                        )}
                    />
                )}

                <Modal
                    title="Add New Post"
                    open={isModalVisible}
                    onOk={handleAddPost}
                    onCancel={() => setIsModalVisible(false)}
                    okText="Add"
                >
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{ title: '', content: '' }}
                    >
                        <Form.Item
                            label="Title"
                            name="title"
                            rules={[{ required: true, message: 'Please input the title!' }]}
                        >
                            <Input placeholder="Enter title" />
                        </Form.Item>
                        <Form.Item
                            label="Content"
                            name="content"
                            rules={[{ required: true, message: 'Please input the content!' }]}
                        >
                            <Input.TextArea placeholder="Enter content" rows={4} />
                        </Form.Item>
                    </Form>
                </Modal>
            </Content>
        </Layout>
    );
};

export default PostList;

