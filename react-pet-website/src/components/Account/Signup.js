import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Modal, Alert } from 'react-bootstrap';
import APIs, { endpoints } from '../../configs/APIs';
// import styled, { keyframes } from 'styled-components';

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
    const [step, setStep] = useState(1); // State to control form step
    const [isDateFocused, setIsDateFocused] = useState(false); // Trạng thái cho biết người dùng đã nhấn vào hay chưa

    const [emailError, setEmailError] = useState('');  // Trạng thái lỗi email

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);
    const closeModal = async () => {
        setShowSuccessModal(false);
        nav('/login');
    };

    const handleNextStep = () => {
        // Xóa lỗi trước khi kiểm tra
        setError('');

        // Tính tuổi
        const today = new Date();
        const birthDate = new Date(date_of_birth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        // Kiểm tra tuổi
        if (age < 13) {
            setError('Bạn phải ít nhất 13 tuổi để đăng ký.');
            return;
        }

        // Nếu đủ tuổi thì gọi hàm nextStep để chuyển bước
        nextStep();
    };


    // const checkUsernameExists = async () => {
    //     try {
    //         const response = await APIs.get(`${endpoints['check_username']}?username=${username}`);
    //         return response.data.exists;
    //     } catch (error) {
    //         console.error('Error checking username:', error);
    //         return false;
    //     }
    // };

    const checkEmailExists = async () => {
        try {
            const response = await APIs.get(`${endpoints['check_email_exist']}?email=${email}`);
            console.log('Email check response:', response);  // Log để kiểm tra kết quả API

            if (response.data.exists) {
                setEmailError('Email đã được sử dụng.');
                return true;  // Email đã tồn tại
            } else {
                setEmailError('');  // Xóa lỗi nếu email chưa tồn tại
                return false;  // Email không tồn tại
            }
        } catch (error) {
            console.error('Error checking email:', error);
            setEmailError('Có lỗi xảy ra khi kiểm tra email. Vui lòng thử lại sau.');
            return false;
        }
    };


    const handleSignup = async () => {
        try {
            setError('');  // Reset error message

            // Kiểm tra nếu có trường nào bỏ trống
            if (!username || !password || !email || !first_name || !last_name || !gender || !date_of_birth) {
                setError('Vui lòng điền đầy đủ thông tin.');
                return;
            }

            // Kiểm tra email có tồn tại không
            const emailExists = await checkEmailExists();
            console.log('Email exists:', emailExists);  // Log để kiểm tra kết quả

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

        <Container fluid className="d-flex justify-content-center align-items-center" style={containerStyles}>
            <Row className="justify-content-center">
                <Col md="8" lg="8"> {/* Increased width for horizontal layout */}
                    <div className="card p-4 shadow bg-white rounded" style={step === 1 ? firstFormCardStyles : secondFormCardStyles}> {/* Apply the appropriate form styles */}
                        <Form>
                            <h1 className="text-center mb-4" style={{ color: '#1877f2' }}>Đăng ký</h1>

                            {/* First Form: Personal Information */}
                            {step === 1 && (
                                <div style={firstFormCardStyles}>  {/* Apply first form styles */}
                                    <Row>
                                        <Col md="6">
                                            <Form.Group controlId="formBasicFirstName">
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Tên"
                                                    value={first_name}
                                                    onChange={(e) => setFirstname(e.target.value)}
                                                    required
                                                    style={inputStyles}
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
                                                    style={inputStyles}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group controlId="formBasicGender">
                                        <Form.Control
                                            as="select"
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                            required
                                            style={inputStyles}
                                        >
                                            <option value="">Chọn giới tính</option>
                                            <option value="1">Nam</option>
                                            <option value="2">Nữ</option>
                                            <option value="3">Khác</option>
                                        </Form.Control>
                                    </Form.Group>

                                    <Form.Group controlId="formBasicDOB">
                                        <Form.Control
                                            type={isDateFocused ? "date" : "text"} // Chuyển từ "text" sang "date" khi nhấn
                                            value={date_of_birth}
                                            onFocus={() => setIsDateFocused(true)} // Khi người dùng nhấn vào trường nhập liệu
                                            onBlur={() => !date_of_birth && setIsDateFocused(false)} // Quay về "text" nếu không có giá trị
                                            onChange={(e) => setDateOfBirth(e.target.value)}
                                            placeholder="Ngày sinh" // Hiển thị "Ngày sinh" khi chưa nhấn vào
                                            required
                                            style={inputStyles}
                                        />
                                        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

                                    </Form.Group>

                                    <Button variant="primary" type="button" className="w-100 mt-3" onClick={handleNextStep} style={buttonStyles}>
                                        Tiếp tục
                                    </Button>
                                </div>
                            )}

                            {/* Second Form: Account Information */}
                            {step === 2 && (
                                <div style={secondFormCardStyles}> {/* Apply second form styles */}
                                    <Form.Group controlId="formBasicEmail">
                                        <Form.Control
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            style={inputStyles}
                                        />
                                    </Form.Group>
                                    {emailError && <Form.Text style={{ color: 'red' }}>{emailError}</Form.Text>}  {/* Hiển thị lỗi dưới email */}


                                    <Row>
                                        <Col md="6">
                                            <Form.Group controlId="formBasicUsername">
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Tên đăng nhập"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    required
                                                    style={inputStyles}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md="6">
                                            <Form.Group controlId="formBasicPassword">
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Mật khẩu"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    style={inputStyles}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

                                    <div className="d-flex justify-content-between mt-3">
                                        <Button variant="secondary" type="button" onClick={prevStep} style={buttonStyles}>
                                            Quay lại
                                        </Button>

                                        <Button variant="primary" type="button" onClick={handleSignup} style={buttonStyles}>
                                            Đăng ký
                                        </Button>
                                    </div>
                                </div>
                            )}

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

// const slideIn = keyframes`
//     from {
//         opacity: 0;
//         transform: translateX(-100%);
//     }
//     to {
//         opacity: 1;
//         transform: translateX(0);
//     }
// `;

// const SlideInDiv = styled.div`
//     animation: ${slideIn} 0.8s ease-out;
// `;


const containerStyles = {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    backgroundImage: 'url("https://wallpaperaccess.com/full/9206781.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '110px 620px 0 0',
};

// Styles for the first form (Personal Information)
const firstFormCardStyles = {
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: '600px', // Standard width for the first form
};

// Styles for the second form (Account Information)
const secondFormCardStyles = {
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: '900px',  // Increased width for the second form for a rectangular, horizontal look
};

const inputStyles = {
    borderRadius: '4px',
    marginBottom: '20px',
    padding: '10px',
    border: '1px solid #ced4da',
    fontSize: '16px',
};

const buttonStyles = {
    borderRadius: '4px',
    backgroundColor: '#1877f2',
    border: 'none',
    padding: '10px 20px',
    fontSize: '16px',
    color: '#fff',
    cursor: 'pointer',
};



export default Signup;
