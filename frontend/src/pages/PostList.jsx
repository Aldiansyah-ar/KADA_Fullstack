import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, Typography, Layout, Spin, Button, Input, message, List, Space, Modal, Form, Pagination } from 'antd';

const { Title } = Typography;
const { Content } = Layout;
const { Search } = Input;

const PostList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentPage, setcurrentPage] = useState(1);
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10) 
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchPosts()
    }, [page, pageSize]);

    const fetchPosts = async () => {
        setLoading(true)
        try {
            let url = `http://localhost:3000/posts?page=${page}&pageSize=${pageSize}`

            const response = await fetch(url).then(res => res.json())
            .then(data => {
                setPosts(data.data)
                setTotal(data.total)
            })

            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const data = await response.json();
            setPosts(data);
            setDisplayedPosts(data);
            setcurrentPage(1)
        } catch (error) {
            console.error("Error fetching posts:", error);
            message.error("Failed to fetch posts");
        } finally {
            setLoading(false);
        }
    };

    const showAddModal = () => {
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleAddPost = async () => {
        try {
            const values = await form.validateFields();
            const response = await fetch(`http://localhost:3000/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: values.title,
                    content: values.content
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to add post');
            }

            const newPost = await response.json();
            const newPosts = [newPost, ...posts];
            setPosts(newPosts);
            filterPosts(newPosts, searchText);
            setIsModalVisible(false);
            message.success("Post added successfully");
        } catch (error) {
            console.error("Error adding post:", error);
            message.error(error.message || "Failed to add post");
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            const response = await fetch(`http://localhost:3000/posts/${postId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete post');
            }

            const newPosts = posts.filter(post => post._id !== postId);
            setPosts(newPosts);
            filterPosts(newPosts, searchText);
            message.success("Post deleted successfully");
        } catch (error) {
            console.error("Error deleting post:", error);
            message.error("Failed to delete post");
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
        filterPosts(posts, value);
    };

    const filterPosts = (allPosts, text) => {
        if (!text) {
            setFilteredPosts(allPosts);
            return;
        }
        const filtered = allPosts.filter(post =>
            post.title.toLowerCase().includes(text.toLowerCase()) ||
            post.content.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredPosts(filtered);
    };

    const paginatedData = filteredPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: 300 }}
                    />
                </div>

                {loading ? (
                    <Spin size="large" style={{ display: 'block', margin: 'auto' }} />
                ) : (
                    <>
                        <List
                            dataSource={paginatedData}
                            renderItem={post => (
                                <List.Item
                                    key={post._id}
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
                                                <Link to={`/posts/${post._id}`}>{post.title}</Link>
                                            </Space>
                                        }
                                        description={
                                            <>
                                                <div>{post.content}</div>
                                                {post.createdAt && (
                                                    <div style={{ fontSize: '0.8em', color: '#666', marginTop: '8px' }}>
                                                        Created: {new Date(post.createdAt).toLocaleString()}
                                                    </div>
                                                )}
                                            </>
                                        }
                                    />
                                    <Space>
                                        <Link to={`/posts/${post._id}`}>
                                            <Button type="link">View</Button>
                                        </Link>
                                        <Button
                                            danger
                                            size="small"
                                            onClick={() => handleDeletePost(post._id)}
                                        >
                                            Delete
                                        </Button>
                                    </Space>
                                </List.Item>
                            )}
                        />

                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Pagination
                                current={currentPage}
                                total={filteredPosts.length}
                                pageSize={pageSize}
                                showSizeChanger
                                onChange={(page, size) => {
                                    setcurrentPage(page);
                                    setPageSize(size);
                                }}
                            />
                        </div>
                    </>
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