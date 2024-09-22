import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row } from 'react-bootstrap';
import APIs, { endpoints, authAPI } from "../../configs/APIs";
import cookie from "react-cookies";
import { MyDispatchContext } from '../../configs/MyContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import backgroundImg from '../../images/login2.jpeg'; // Import the image
import friendImg from '../../images/friend.png'
import giftBoxImg from '../../images/giftbox.png'
import earthImg from '../../images/earth.png'


const typewriterTexts = ["Chó", "Mèo", "Chim", "Hamster"];

const Login = ({ setShowSidebar }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [usernameError, setUsernameError] = useState(''); // State for username error
    const [passwordError, setPasswordError] = useState(''); // State for password error
    const dispatch = useContext(MyDispatchContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const nav = useNavigate();

    useEffect(() => {
        let typewriterInterval;

        const typeText = () => {
            const text = typewriterTexts[currentTextIndex];
            let index = 0;
            setDisplayedText('');

            typewriterInterval = setInterval(() => {
                setDisplayedText(prev => prev + text[index]);
                index++;
                if (index >= text.length) {
                    clearInterval(typewriterInterval);
                    setTimeout(() => {
                        setDisplayedText(''); // Clear the text to avoid undefined characters
                        setCurrentTextIndex((prevIndex) => (prevIndex + 1) % typewriterTexts.length);
                    }, 1000); // Pause before switching text
                }
            }, 150); // Adjust typing speed here
        };

        typeText();

        return () => clearInterval(typewriterInterval);
    }, [currentTextIndex]);

    const validateForm = () => {
        let valid = true;

        if (!username) {
            setUsernameError('Vui lòng nhập tên đăng nhập');
            valid = false;
        } else {
            setUsernameError('');
        }

        if (!password) {
            setPasswordError('Vui lòng nhập mật khẩu');
            valid = false;
        } else {
            setPasswordError('');
        }

        return valid;
    };

    const handleLoginError = (errorStatus) => {
        switch (errorStatus) {
            case 400:
                setError("Sai tên đăng nhập hoặc mật khẩu");
                break;
            default:
                setError("Đăng nhập không thành công");
                break;
        }
    };

    const login = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            let res = await APIs.post(endpoints['login'], {
                'username': username,
                'password': password,
                'client_id': "WqSXjpJFCwdImp5Akdcou8atIxQcmAyLK5fjLWoN",
                'client_secret': "H5aeBg6Y81eXR0o5DOaskJVKOySfFxYsUuEMqjSxvu3UM7vZWJQG7WmbejXktDmy2mMc6OuXysdSHLwHlXBvTyZC5q8Z7dejJXVbsmO1u0VGG64YxO6qCWzTQRKkEl9w",
                'grant_type': "password",
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.status === 200) {
                cookie.save("token", res.data.access_token);
                nav("/");
                let userdata = await authAPI().get(endpoints['current_user']);
                cookie.save('user', userdata.data);
                dispatch({
                    "type": "login",
                    "payload": userdata.data
                });

                if(userdata.data.role === 2 ){
                    nav("/moderator");
                } else{
                    nav("/moderator");
                }



                setShowSidebar(true);
            } else {
                handleLoginError(res.status);
            }
        } catch (ex) {
            setError("Sai tên hoặc mật khẩu, vui lòng thử lại.");
            setLoading(false);
        }
    };

    const register = () => {
        nav("/signup");
    };

    return (
        <>
            <Container
                fluid
                className="d-flex justify-content-end align-items-center"  // Di chuyển form sang bên phải
                style={styles.container}
            >
                <div style={styles.headerText}>
                    Mạng xã hội hữu ích
                    <br /> cho người yêu 
                    <span style={styles.typewriterText}>
                        {displayedText}
                        <span style={styles.blinkingCursor}> </span>
                    </span>
                </div>
                <Row className="justify-content-md-end" style={{ width: '100%' }}>
                    <div className="card p-3 shadow bg-white rounded" style={styles.card}>
                        <Form>
                            <h1 className="text-center mb-3">Đăng nhập</h1>
                            <Form.Group controlId="formBasicEmail" style={styles.formGroup}>
                                <Form.Control
                                    type="text"
                                    placeholder="Nhập tên đăng nhập"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    isInvalid={!!usernameError}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {usernameError}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group controlId="formBasicPassword" style={styles.formGroup}>
                                <Form.Control
                                    type="password"
                                    placeholder="Nhập mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    isInvalid={!!passwordError}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {passwordError}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group controlId="formBasicCheckbox" className="d-flex justify-content-between align-items-center" style={styles.checkboxGroup}>
                                <Form.Check type="checkbox" label="Nhớ tài khoản" />
                                <Button variant="link" onClick={() => { /* Xử lý quên mật khẩu */ }}>
                                    Quên mật khẩu
                                </Button>
                            </Form.Group>

                            {error && <p style={styles.errorText}>{error}</p>} {/* Hiển thị lỗi */}

                            <Button
                                variant="warning"
                                type="button"
                                className="w-100"
                                onClick={login}
                                disabled={loading}  // Nút sẽ bị vô hiệu hóa khi loading = true
                                style={styles.loginButton} // Nút với màu cam nhạt
                            >
                                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </Button>

                            <div className="text-center mt-3">
                                <a href="#" onClick={register} style={styles.registerLink}>
                                    Quên tài khoản? Đăng ký
                                </a>
                            </div>
                        </Form>
                    </div>
                </Row>
            </Container>

            {/* Combined Section - Icon, Description, and User with Dog */}
            <div style={styles.combinedSection}>
                {/* Heading */}
                <div style={styles.headingContainer}>
                    <span style={styles.headingText}>Bạn sẽ có những trải nghiệm cực thú vị cùng thú cưng</span>
                </div>

                {/* Icon and Description - Section 1 */}
                <div style={styles.iconAndDescription}>
                    <img src={earthImg} alt="earth icon" style={styles.icon} />
                    <div style={styles.descriptionText}>
                        <h3>Mạng xã hội</h3>
                        <p>
                            Đăng lên những hình ảnh, video ghi lại những khoảnh khắc vui vẻ cùng nhau.
                            Kết giao với những người thú vị, tham gia vào các club theo sở thích để xem các nội dung hay.
                            Hoặc nhận những tư vấn giá trị từ các bác sĩ thú y giỏi chuyên môn.
                        </p>
                    </div>
                </div>

                {/* Card Section - User with Dog */}
                <div className="card p-3 shadow bg-white rounded" style={styles.card}>
                    <img src={backgroundImg} alt="User with Dog" style={styles.cardImage} />
                    <div style={styles.caption}>
                        <strong>Minh Nhựt</strong>
                        <p>và bạn chó Golden Retriever tên SAM</p>
                    </div>
                </div>

                {/* Icon and Description - Section 2 */}
                <div style={styles.iconAndDescription}>
                    <img src={giftBoxImg} alt="earth icon" style={styles.icon} />
                    <div style={styles.descriptionText}>
                        <h3>Hữu ích</h3>
                        <p>
                            Tham gia thường xuyên nhận điểm để đổi hàng trăm phần quà cho bạn và thú cưng với Pety Rewards.

                            Hồ sơ sức khỏe thú cưng trên Pety giúp trải nghiệm chăm sóc thú cưng của bạn trở nên thuận tiện hơn nhiều.
                        </p>
                    </div>
                </div>

                {/* Card Section - User with Cat */}
                <div className="card p-3 shadow bg-white rounded" style={styles.card}>
                    <img src={backgroundImg} alt="User with Cat" style={styles.cardImage} />
                    <div style={styles.caption}>
                        <strong>Kim Ngọc</strong>
                        <p>và mèo Bengal tên MIA</p>
                    </div>
                </div>

                {/* Icon and Description - Section 3 */}
                <div style={styles.iconAndDescription}>
                    <img src={friendImg} alt="earth icon" style={styles.icon} />
                    <div style={styles.descriptionText}>
                        <h3>Lan tỏa
                        </h3>
                        <p>
                            Pety là cộng đồng những người cực kỳ yêu động vật. Hãy chuẩn bị trước việc thú cưng của bạn làm cho mọi người xỉu up xỉu down vì độ cute chữ e kéo dài.

                            Pety còn hỗ trợ tìm kiếm thú cưng thất lạc. Câu lạc bộ hiệp sĩ cứu hộ thú cưng trên Pety sẽ không bao giờ làm bạn thất vọng.
                        </p>
                    </div>
                </div>

                {/* Card Section - User with Parrot */}
                <div className="card p-3 shadow bg-white rounded" style={styles.card}>
                    <img src={backgroundImg} alt="User with Parrot" style={styles.cardImage} />
                    <div style={styles.caption}>
                        <strong>Hoàng Minh</strong>
                        <p>và vẹt xanh lá tên TOTO</p>
                    </div>
                </div>

            </div>




        </>
    );
}

const styles = {
    // Background and container settings
    container: {
        height: '100vh',
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        justifyContent: 'flex-end',  // Di chuyển nội dung sang bên phải
        alignItems: 'center',  // Căn giữa theo chiều dọc
        paddingRight: '50px',  // Điều chỉnh khoảng cách với mép phải
        fontFamily: "'Roboto', sans-serif",  // Font Roboto
    },
    headerText: {
        position: 'absolute',
        top: '110px',
        left: '90px',
        color: '#fff',
        fontSize: '40px',
        fontWeight: 'bold',
        zIndex: 9,
        fontFamily: "'Roboto', sans-serif",
    },
    typewriterText: {
        display: 'inline-block',
        fontSize: '40px',
        fontWeight: 'bold',
        fontFamily: "'Roboto', sans-serif",  // Font Roboto
    },
    blinkingCursor: {
        display: 'inline-block',
        width: '0.8em',
        height: '1em',
        backgroundColor: '#fff',
        animation: 'blink 1s step-start infinite',
    },

    // Combined section (layout and content)
    combinedSection: {
        display: 'grid',  // Sử dụng grid thay cho flex
        gridTemplateColumns: '2fr 1fr',  // Tạo 2 cột, phần đầu lớn hơn ảnh
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',  // Khoảng cách giữa các phần tử
        padding: '0 100px',
        maxWidth: '100%',  // Không tràn màn hình
    },

    // Heading section
    headingContainer: {
        gridColumn: 'span 2',  // Tiêu đề chiếm 2 cột
        textAlign: 'left',
        marginBottom: '20px',
    },
    headingText: {
        paddingTop: '100px',
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#333',
    },

    iconAndDescription: {
        display: 'flex',
        alignItems: 'flex-start',  // Căn chỉnh icon ngang hàng với tiêu đề
        gap: '20px',  // Khoảng cách giữa icon và đoạn mô tả
        padding: '0 40px',  // Thêm padding 2 bên để nhích vào trong
    },
    icon: {
        width: '60px',
        height: 'auto',  // Đảm bảo icon giữ tỷ lệ khi thay đổi kích thước
        flexShrink: 0,
    },
    descriptionText: {
        color: '#333',
        fontSize: '18px',
        margin: 0,  // Đảm bảo không có margin làm ảnh hưởng đến căn chỉnh
    },
    h3: {
        margin: 0,  // Đảm bảo tiêu đề không có khoảng cách trên/dưới
    },
    // Card section
    card: {
        maxWidth: '400px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',  // Căn giữa nội dung trong thẻ
    },
    cardImage: {
        width: '120%',
        borderRadius: '8px',
    },
    caption: {
        marginTop: '10px',
        textAlign: 'center',
        color: '#333',
    },

    // Quotation section
    quotationSection: {
        textAlign: 'center',
        marginTop: '40px',
        color: '#6c757d',
        fontSize: '18px',
        fontStyle: 'italic',
    },
    quotationText: {
        fontSize: '22px',
        lineHeight: '1.5',
        color: '#6c757d',
        fontWeight: '500',
    },

    // Emoji row for styling icons
    emojiRow: {
        fontSize: '60px',
        marginTop: '10px',
        color: '#6c757d',
    }
};


export default Login;
