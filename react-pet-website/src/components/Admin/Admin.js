import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, endpoints } from '../../configs/APIs';
import { Button, Modal, Form } from 'react-bootstrap';
import { MyDispatchContext } from '../../configs/MyContext';

// const dispatch = useContext(MyDispatchContext);

const Admin = () => {
    const [moderatorName, setModeratorName] = useState('');
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const dispatch = useContext(MyDispatchContext);

    const handleAdmin = () => {
        alert(`Added new moderator: ${moderatorName}`);
    };

    useEffect(() => {
        fetchUsers()

    }, []);

    const handleLogout = () => {
        dispatch({ type: 'logout' });
        alert("Logged out!");
        navigate('/login');
    };


    // Hàm lấy danh sách người dùng
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await authAPI().get(endpoints.user);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Hàm đóng modal
    const handleClose = () => setShowModal(false);

    const fetchUserDetails = async (userId) => {
        try {
            const response = await authAPI().get(endpoints.patch_profile(userId));
            const userDetails = response.data;

            console.log('User details:', userDetails);
            setSelectedUser(userDetails);
            // Hiển thị modal
            setShowModal(true);

        } catch (error) {
            console.error('Error fetching user details:', error);
            alert('Không thể lấy thông tin user. Vui lòng thử lại.');
        }
    };

    const handleGenderChange = (e) => {
        const updatedGender = e.target.value; // Lấy giá trị mới từ combobox
        setSelectedUser((prevUser) => ({
            ...prevUser,
            gender: parseInt(updatedGender),  // Cập nhật giá trị giới tính cho người dùng
        }));
    };

    const handleDeactivateUser = async (id) => {
        try {
            const res = await authAPI().patch(endpoints.deactive_moderator(id))
            alert("User has been deactivated successfully.");
            fetchUsers();  // Gọi lại hàm để làm mới danh sách người dùng
            handleClose(); // Close the modal after successful deactivation
        } catch (error) {
            console.error("There was an error deactivating the user:", error);
            alert("Failed to deactivate user.");
        }
    };


    return (
        <div style={styles.container}>



            {/* Hiển thị avatar người dùng */}
            {/* {selectedUser && selectedUser.avatar ? (
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <img
                        src={selectedUser.avatar}  // URL của avatar người dùng
                        alt="User Avatar"
                        style={{ width: '80px', height: '80px', borderRadius: '50%' }} // Tạo hình tròn cho avatar
                    />
                </div>
            ) : (
                <p style={{ textAlign: 'center', marginBottom: '10px' }}>No Avatar</p>
            )}
             */}
            {/* Sidebar bên phải */}
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
                        <Link to="/add-moderator" style={styles.sidebarLink}>Thêm Moderator</Link>
                    </li>
                    <li style={styles.sidebarLi}>
                        <button onClick={handleLogout} style={{ ...styles.sidebarLink, ...styles.sidebarButton }}>
                            Logout
                        </button>
                    </li>
                </ul>
            </div>

            {/* Nội dung form thêm moderator */}
            <div style={styles.content}>
                {/* Hiển thị danh sách người dùng */}
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div style={styles.userList}>
                        <h3>Danh sách tài khoản</h3>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Họ Tên</th>
                                    <th style={styles.th}>Username</th>
                                    <th style={styles.th}>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td
                                            style={styles.td}
                                            onClick={() => fetchUserDetails(user.id)}
                                        >
                                            {user.id}
                                        </td>
                                        <td style={styles.td}>{`${user.first_name} ${user.last_name}`}</td>
                                        <td style={styles.td}>{user.username}</td>
                                        <td style={styles.td}>{user.role === 1 ? 'User' : user.role === 2 ? 'Moderator' : 'Admin'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>


            {/* Modal hiển thị thông tin user */}
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Thông tin chi tiết người dùng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser ? (
                        <Form>
                            <Form.Group>
                                <Form.Label><strong>ID:</strong></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={selectedUser.id}
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label><strong>Tên:</strong></Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={`${selectedUser.first_name} ${selectedUser.last_name}`}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label><strong>Email:</strong></Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder={selectedUser.email}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label><strong>Username:</strong></Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={selectedUser.username}
                                />
                            </Form.Group>

                            {/* <Form.Group>
                                <Form.Label><strong>Password:</strong></Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={selectedUser.password}
                                />
                            </Form.Group> */}
                            <Form.Group>
                                <Form.Label><strong>Giới tính:</strong></Form.Label>
                                <Form.Control
                                    as="select"
                                    value={selectedUser.gender}
                                    onChange={(e) => handleGenderChange(e)} // Tạo một hàm để xử lý sự kiện thay đổi
                                >
                                    <option value="1">Nam</option>
                                    <option value="2">Nữ</option>
                                    <option value="3">Khác</option>
                                </Form.Control>
                            </Form.Group>
                            {/* Uncomment this section to show date of birth */}
                            {/* <Form.Group>
                    <Form.Label><strong>Ngày sinh:</strong></Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder={selectedUser.date_of_birth} 
                    />
                </Form.Group> */}
                        </Form>
                    ) : (
                        <p>Đang tải dữ liệu...</p>
                    )}
                </Modal.Body>
                <Modal.Footer>


                    <Button variant="secondary" onClick={handleClose}>
                        Đóng
                    </Button>

                    <Button variant="danger" onClick={() => handleDeactivateUser(selectedUser.id)}>
                        Xóa người dùng
                    </Button>
                </Modal.Footer>
            </Modal>


        </div>
    );
};


// Định nghĩa CSS dưới dạng một object
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: '280px',
        width: '1900px',

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
    content: {
        marginRight: '820px', // Dành chỗ cho sidebar
        padding: '20px',
        width: 'calc(100%)',
        backgroundColor: '#f8f9fa',
        maxWidth: '900px'
    },
    input: {
        display: 'block',
        margin: '10px 0',
        padding: '10px',
        width: '100%',
        boxSizing: 'border-box',
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    userList: {
        marginTop: '20px',
        textAlign: 'left',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse', // Loại bỏ khoảng trống giữa các ô
        border: '1px solid #ddd', // Thêm viền cho toàn bộ bảng
    },
    th: {
        borderBottom: '2px solid #ddd',
        padding: '8px',
        textAlign: 'left', // Căn trái cho tiêu đề cột
        backgroundColor: '#f4f4f4', // Màu nền cho tiêu đề cột
        border: '1px solid #ddd', // Viền cho ô tiêu đề
    },
    td: {
        padding: '8px',
        borderBottom: '1px solid #ddd',
        textAlign: 'left', // Căn trái cho dữ liệu cột
        border: '1px solid #ddd', // Viền cho từng ô dữ 
        cursor: 'pointer'    // Con trỏ nhấn
    },
};
export default Admin;
