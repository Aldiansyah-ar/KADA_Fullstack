import { Link } from 'react-router-dom';
import { Button, Typography, Layout, Row, Col, Card } from 'antd';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const Home = () => {
    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Content>
                <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
                    <Col xs={22} sm={16} md={12} lg={8}>
                        <Card bordered={false} style={{ padding: '30px', textAlign: 'center' }}>
                            <Title level={2}>Welcome to Post Explorer</Title>
                            <Paragraph style={{ marginBottom: 30 }}>
                                Browse a list of posts fetched from a sample API. Click below to explore!
                            </Paragraph>
                            <Link to="/posts">
                                <Button type="primary" size="large">Go to Posts</Button>
                            </Link>
                        </Card>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default Home;
