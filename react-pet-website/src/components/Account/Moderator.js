import React, { useState, useEffect, useContext } from 'react';
import { Modal, Form, Card, Button, Alert } from 'react-bootstrap';
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
    const [user, setUser] = useState([]);
    const [error, setError] = useState('');
    const [newCategory, setNewCategory] = useState(''); // State to handle new category input
    const [showModal, setShowModal] = useState(false); // State to control modal visibility
    const [alertMessage, setAlertMessage] = useState(''); // State for displaying success/failure message
    const [alertVariant, setAlertVariant] = useState(''); // State to control alert type (success or danger)
    const [showAlert, setShowAlert] = useState(false); // State to control the visibility of the alert

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await authAPI().get(endpoints['current_user']); // Replace 'current_user' with your actual API endpoint
                const data = response.data;
                setUser(data); // Store the user data in the state
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUser();
    }, []);



    const handleLogout = () => {
        cookie.remove('user');
        dispatch({ type: 'logout' });
        navigate('/login');
    };

    // Function to add a new category
    // Function to add a new category
    const addCategory = async (e) => {
        e.preventDefault();
        if (newCategory.trim() === '') {
            setError('Bạn cần nhập tên danh mục.');
            return;
        }

        try {
            const response = await authAPI().post('http://127.0.0.1:8000/categories/', { name: newCategory });
            setCategories([...categories, response.data]); // Add new category to the list
            setNewCategory(''); // Clear input after successful submission
            setError('');
            setShowModal(false); // Close modal after adding
            setAlertMessage('Category added successfully!'); // Set success message
            setAlertVariant('success'); // Set alert to success type
            setShowAlert(true); // Show alert
        } catch (error) {
            console.error('Error adding category:', error);
            setAlertMessage('Failed to add category. Please try again.'); // Set error message
            setAlertVariant('danger'); // Set alert to danger type
            setShowAlert(true); // Show alert

        }
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

    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => {
                setShowAlert(false); // Hide the alert after 2 seconds
            }, 2000); // Set the duration to 2 seconds
            return () => clearTimeout(timer); // Cleanup the timer on component unmount
        }
    }, [showAlert]);

    return (
        <div style={css.container}>
            {/* Phần hiển thị nội dung chính bên trái */}
            <div style={{ flex: 8, ...css.mainContent }}>
                <Card className="text-center">
                    <Card.Header as="h1">Xin chào, quản lí {user.first_name} {user.last_name}</Card.Header>
                    <Card.Body>
                        {showAlert && (
                            <Alert
                                variant={alertVariant}
                                style={showAlert ? css.alertPopup : { ...css.alertPopup, ...css.fadeOut }}
                            >
                                <i className={alertVariant === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill'}></i>
                                {` ${alertMessage}`}
                            </Alert>
                        )}

                        {/* Hiển thị nội dung dựa trên trạng thái của activeSection */}
                        {activeSection === 'categories' && (
                            <div style={css.categoryList}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 className="mt-4">Categories</h3>
                                    <Button
                                        variant="success"
                                        style={css.addButton}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = css.addButtonHover.backgroundColor}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                                        onClick={() => setShowModal(true)}
                                        
                                    >
                                        Thêm Category
                                    </Button>
                                </div>
                                <ul className="list-group">
                                    {categories.map(category => (
                                        <li
                                            key={category.id}
                                            style={css.categoryItem}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = css.categoryItemHover.backgroundColor}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                                        >
                                            {category.name}
                                        </li>
                                    ))}
                                </ul>

                            </div>
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

            {/* Modal for adding new category */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Thêm Category Mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={addCategory}>
                        <Form.Group controlId="formCategoryName">
                            <Form.Label>Category Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter category name"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                            />
                            {error && <small className="text-danger">{error}</small>}
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">
                            Thêm Category
                        </Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

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
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
    },

    card: {
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '10px',
        padding: '20px',
    },

    categoryList: {
        listStyle: 'none',
        padding: 0,
        margin: '20px 0',
    },

    categoryItem: {
        padding: '10px 15px',
        backgroundColor: '#fff',
        marginBottom: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'transform 0.2s ease-in-out',
    },

    categoryItemHover: {
        transform: 'scale(1.02)',
    },

    addButton: {
        width: 'auto', // Change from 100% to auto
        minWidth: '120px', // Optional: set a minimum width
        backgroundColor: '#28a745', // Green color
        borderColor: '#28a745',
        borderRadius: '4px',
        padding: '10px 15px', // Adjust padding for a better look
        fontWeight: 'bold',
        marginTop: '10px',
    },

    addButtonHover: {
        backgroundColor: '#218838',
    },

    alertPopup: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        minWidth: '250px',
        zIndex: 9999,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        opacity: 1,
        transition: 'opacity 0.5s ease-in-out',
    },

    fadeOut: {
        opacity: 0,
        transition: 'opacity 0.5s ease-in-out',
    },
};


export default Moderator;
