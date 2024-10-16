import React, { useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { authAPI, endpoints } from "../../configs/APIs";

const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        paddingLeft: "420px",

    },
    formBox: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        maxWidth: '600px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    },
    formRow: {
        marginBottom: '15px',
    },
    submitButton: {
        marginTop: '20px',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#343a40',
        marginBottom: '20px',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    sidebar: {
        position: 'fixed',
        right: 0,
        top: 0,
        width: '200px',
        height: '100%',
        backgroundColor: '#f4f4f4',
        padding: '20px',
        boxShadow: '-2px 0 5px rgba(0, 0, 0, 0.1)',
    },
    sidebarUl: {
        listStyleType: 'none',
        padding: 0,
    },
    sidebarLi: {
        margin: '20px 0',
    },
    sidebarLink: {
        textDecoration: 'none',
        color: '#333',
        backgroundColor: '#ddd',
        padding: '10px',
        display: 'block',
        textAlign: 'center',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
    },
    sidebarButton: {
        backgroundColor: '#ff4d4d',
        color: 'white',
    },
};

const AddModerator = () => {
    const [moderatorData, setModeratorData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        username: "",
        password: "",
        gender: "",
        date_of_birth: ""
    });

    const navigate = useNavigate();

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setModeratorData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const moderatorPayload = {
            ...moderatorData,
            role: 2  // Default role for moderator
        };

        try {
            const response = await authAPI().post(endpoints.signup, moderatorPayload);
            if (response.status === 201) {
                alert('Moderator created successfully!');

            }
        } catch (error) {
            alert('Failed to create moderator. Please try again.');
        }
    };

    const handleLogout = () => {
        alert("Logged out!");
        navigate('/login');
    };

    const fetchUsers = async () => {
        setTimeout(() => {
            navigate('/admin');
        }, );
    };

    return (
        <div style={styles.container}>
            {/* Form thêm Moderator */}
            <Form onSubmit={handleSubmit} style={styles.formBox}>
                <span style={styles.title}>Thêm tài khoản quản lí viên</span>
                <Row style={styles.formRow}>
                    <Col md={6}>
                        <Form.Group controlId="firstName">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="first_name"
                                value={moderatorData.first_name}
                                onChange={handleInputChange}
                                placeholder="Enter first name"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="lastName">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="last_name"
                                value={moderatorData.last_name}
                                onChange={handleInputChange}
                                placeholder="Enter last name"
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group controlId="email" style={styles.formRow}>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={moderatorData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email"
                    />
                </Form.Group>

                <Form.Group controlId="username" style={styles.formRow}>
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="text"
                        name="username"
                        value={moderatorData.username}
                        onChange={handleInputChange}
                        placeholder="Enter username"
                    />
                </Form.Group>

                <Form.Group controlId="password" style={styles.formRow}>
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="text"
                        name="password"
                        value={moderatorData.password}
                        onChange={handleInputChange}
                        placeholder="Enter password"
                    />
                </Form.Group>

                <Form.Group controlId="gender" style={styles.formRow}>
                    <Form.Label>Gender</Form.Label>
                    <Form.Control
                        as="select"
                        name="gender"
                        value={moderatorData.gender}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Gender</option>
                        <option value="1">Male</option>
                        <option value="2">Female</option>
                        <option value="3">Other</option>
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="dateOfBirth" style={styles.formRow}>
                    <Form.Label>Date of Birth</Form.Label>
                    <Form.Control
                        type="date"
                        name="date_of_birth"
                        value={moderatorData.date_of_birth}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                <Button variant="primary" type="submit" style={styles.submitButton}>
                    Create Moderator
                </Button>
            </Form>

            {/* Sidebar */}
            <div style={styles.sidebar}>
                <ul style={styles.sidebarUl}>
                    <li style={styles.sidebarLi}>
                        <Link
                            to="#"
                            style={styles.sidebarLink}
                            onClick={fetchUsers}
                        >
                            Hiện danh sách user
                        </Link>
                    </li>
                    <li style={styles.sidebarLi}>
                        <Link to="/add-moderator" style={styles.sidebarLink}>
                            Thêm Moderator
                        </Link>
                    </li>
                    <li style={styles.sidebarLi}>
                        <button onClick={handleLogout} style={{ ...styles.sidebarLink, ...styles.sidebarButton }}>
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default AddModerator;
