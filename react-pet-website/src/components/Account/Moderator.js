import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

import cookie from 'react-cookies';

import { MyDispatchContext } from '../../configs/MyContext';
import { authAPI, endpoints } from '../../configs/APIs';



const Moderator = () => {
    const navigate = useNavigate();
    const dispatch = useContext(MyDispatchContext);
    const [categories, setCategories] = useState([]); // State để lưu category
    const [showCategories, setShowCategories] = useState(false); // State để điều khiển việc hiển thị danh mục
    const [showTopic, setShowTopic] = useState(false);
    const [topics, setTopic] = useState([]);
    const [activeSection, setActiveSection] = useState(null); // Quản lý trạng thái của section đang hiển thị

    const handleLogout = () => {
        cookie.remove('user');
        dispatch({ type: 'logout' });
        navigate('/login');
    };

    // Hàm gọi API để lấy danh sách categories
    const fetchCategories = async () => {
        try {
            const response = await authAPI().get(endpoints['category']);
            const data = response.data;
            setCategories(data); // Lưu dữ liệu vào state
            setShowCategories(true); // Hiển thị danh mục sau khi lấy dữ liệu
            setActiveSection('categories'); // Hiển thị phần categories
            console.log(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchTopics = async () => {
        try {
            const res = await authAPI().get(endpoints['topic']);
            const data = res.data;
            setTopic(data);
            setShowTopic(true);
            setActiveSection('topics'); // Hiển thị phần topics
            console.log(data);
        } catch (error) {
            console.error('Error fetch Topic:', error);
        }
    }


    return (
        <div style={css.container}>
            {/* Phần hiển thị nội dung chính bên trái */}
            <div style={{ flex: 8, ...css.mainContent }}>
                <Card className="text-center">
                    <Card.Header as="h1">Welcome, Moderator!</Card.Header>
                    <Card.Body>
                        <Card.Text>
                            This is the moderator dashboard where you can manage content, users, and other administrative tasks.
                        </Card.Text>

                        {/* Hiển thị nội dung dựa trên trạng thái của activeSection */}
                        {activeSection === 'categories' && (
                            <>
                                <h3 className="mt-4">Categories</h3>
                                <ul className="list-group">
                                    {categories.map(category => (
                                        <li key={category.id} className="list-group-item">
                                            {category.name}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {activeSection === 'topics' && (
                            <>
                                <h3 className="mt-4">Topics</h3>
                                <ul className="list-group">
                                    {topics.map(topic => (
                                        <li key={topic.id} className="list-group-item">
                                            {topic.name} - Danh mục: {topic.category?.name || 'No Category'}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </Card.Body>
                    <Card.Footer className="text-muted">Your role is crucial in maintaining the quality of the platform.</Card.Footer>
                </Card>
            </div>

            {/* Sidebar bên phải */}
            <div style={{ flex: 2, ...css.sidebar }}>
                <h4>Actions</h4>
                <Button 
                    variant="primary" 
                    onClick={fetchCategories} 
                    style={css.button}
                >
                    Show Categories
                </Button>
                <Button 
                    variant="primary" 
                    onClick={fetchTopics} 
                    style={css.button}
                >
                    Show Topics
                </Button>
                <Button 
                    variant="danger" 
                    onClick={handleLogout} 
                    style={css.button}
                >
                    Logout
                </Button>
            </div>
        </div>
    );
};

// Hàm chứa CSS
const css = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
    },
    sidebar: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        height: '100vh',
        borderLeft: '1px solid #ddd',
    },
    mainContent: {
        padding: '20px',
        paddingLeft: '15%',
    },
    button: {
        width: '100%',
        marginBottom: '10px',
    },
};

export default Moderator;
