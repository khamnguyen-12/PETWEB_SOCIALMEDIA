import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Modal } from 'react-bootstrap';
import APIs, { endpoints } from '../../configs/APIs';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [first_name, setFirstname] = useState('');
    const [last_name, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState('');
    const [date_of_birth, setDateOfBirth] = useState('');
    const [error, setError] = useState('');
    const nav = useNavigate();
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const closeModal = async () => {
        setShowSuccessModal(false);
        nav('/login');
    };

    const checkUsernameExists = async () => {
        try {
            const response = await APIs.get(`${endpoints['check_username']}?username=${username}`);
            return response.data.exists;
        } catch (error) {
            console.error('Error checking username:', error);
            return false;
        }
    };

    const checkEmailExists = async () => {
        try {
            const response = await APIs.get(`${endpoints['check_email']}?email=${email}`);
            return response.data.exists;
        } catch (error) {
            console.error('Error checking email:', error);
            return false;
        }
    };

    const handleSignup = async () => {
        try {
            setError('');  // Reset error message

            if (!username || !password || !email || !first_name || !last_name || !gender || !date_of_birth) {
                setError('Vui lòng điền đầy đủ thông tin.');
                return;
            }

        // Calculate age
        const today = new Date();
        const birthDate = new Date(date_of_birth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 13) {
            setError('Bạn phải ít nhất 13 tuổi để đăng ký.');
            return;
        }

            // Check if username or email already exists
            const usernameExists = await checkUsernameExists();
            const emailExists = await checkEmailExists();

            if (usernameExists) {
                setError('Tên đăng nhập đã tồn tại.');
                return;
            }

            if (emailExists) {
                setError('Email đã được sử dụng.');
                return;
            }

            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            formData.append('first_name', first_name);
            formData.append('last_name', last_name);
            formData.append('email', email);
            formData.append('gender', gender);
            formData.append('date_of_birth', date_of_birth);

            console.log("Data sent to API:", {
                username, password, first_name, last_name, email, gender, date_of_birth
            });

            let response = await APIs.post(endpoints['signup'], formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("API response:", response);

            if (response.status === 201) {
                setShowSuccessModal(true);
            } else {
                setError('Email hoặc username đã tồn tại. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error while signing up:', error);
            if (error.response) {
                console.error('API response error data:', error.response.data);
                // Handle specific errors from the API if needed
                setError('Email hoặc username đã tồn tại. Vui lòng thử lại.');
            }
        }
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-center"
            style={{
                minHeight: '100vh',
                backgroundColor: '#f0f2f5',
                backgroundImage: 'url("https://cache.marriott.com/marriottassets/marriott/BOMSA/bomsa-exterior-0023-hor-feat.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                padding: '200px',
            }}>
            <Row className="justify-content-center">
                <Col md="6" lg="6">
                    <div className="card p-4 shadow bg-white rounded" style={{ borderRadius: '8px' }}>
                        <Form>
                            <h1 className="text-center mb-4" style={{ color: '#1877f2' }}>Đăng ký</h1>

                            <Row>
                                <Col md="6">
                                    <Form.Group controlId="formBasicFirstName">
                                        <Form.Control
                                            type="text"
                                            placeholder="Tên"
                                            value={first_name}
                                            onChange={(e) => setFirstname(e.target.value)}
                                            required
                                            style={{ borderRadius: '4px', marginBottom: '30px' }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md="6">
                                    <Form.Group controlId="formBasicLastName">
                                        <Form.Control
                                            type="text"
                                            placeholder="Họ"
                                            value={last_name}
                                            onChange={(e) => setLastname(e.target.value)}
                                            required
                                            style={{ borderRadius: '4px', marginBottom: '30px' }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group controlId="formBasicEmail">
                                <Form.Control
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ borderRadius: '4px', marginBottom: '30px' }}
                                />
                            </Form.Group>

                            <Form.Group controlId="formBasicUsername">
                                <Form.Control
                                    type="text"
                                    placeholder="Tên đăng nhập"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    style={{ borderRadius: '4px', marginBottom: '30px' }}
                                />
                            </Form.Group>

                            <Form.Group controlId="formBasicPassword">
                                <Form.Control
                                    type="password"
                                    placeholder="Mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{ borderRadius: '4px', marginBottom: '30px' }}
                                />
                            </Form.Group>

                            <Form.Group controlId="formBasicGender">
                                <Form.Control
                                    as="select"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    required
                                    style={{ borderRadius: '4px', marginBottom: '30px' }}
                                >
                                    <option value="">Chọn giới tính</option>
                                    <option value="1">Nam</option>
                                    <option value="2">Nữ</option>
                                    <option value="3">Khác</option>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId="formBasicDOB">
                                <Form.Control
                                    type="date"
                                    placeholder="Ngày sinh"
                                    value={date_of_birth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    required
                                    style={{ borderRadius: '4px', marginBottom: '30px' }}
                                />
                            </Form.Group>

                            {error && <div className="text-danger">{error}</div>}

                            <Button variant="primary" type="button" className="w-100 mt-3" onClick={handleSignup}
                                style={{ borderRadius: '4px', backgroundColor: '#1877f2', border: 'none', padding: '10px 0' }}>
                                Đăng ký
                            </Button>

                            <div className="text-center mt-3">
                                <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
                            </div>
                        </Form>
                    </div>
                </Col>
            </Row>
            <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Đăng ký thành công</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Tài khoản của bạn đã được tạo thành công. Bạn có thể đăng nhập ngay bây giờ.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={closeModal}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Signup;
