import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, endpoints } from '../../configs/APIs';



const AddModerator = () => {
    const [moderatorName, setModeratorName] = useState('');
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleAddModerator = () => {
        alert(`Added new moderator: ${moderatorName}`);
    };

    const handleLogout = () => {
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



    return (
        <div style={styles.container}>
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
                <h2>Add a New Moderator</h2>
                <input
                    type="text"
                    value={moderatorName}
                    onChange={(e) => setModeratorName(e.target.value)}
                    placeholder="Enter moderator name"
                    style={styles.input}
                />
                <button onClick={handleAddModerator} style={styles.button}>
                    Add Moderator
                </button>

                {/* Hiển thị danh sách người dùng */}
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div style={styles.userList}>
                        <h3>User List</h3>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Họ Tên</th>
                                    <th style={styles.th}>Username</th>
                                    <th style={styles.th}>Role</th>
                                    <th style={styles.th}>Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td style={styles.td}>{user.id}</td>
                                        <td style={styles.td}>{`${user.first_name} ${user.last_name}`}</td>
                                        <td style={styles.td}>{user.username}</td>
                                        <td style={styles.td}>{user.role === 1 ? 'User' : user.role === 2 ? 'Moderator' : 'Admin'}</td>
                                        <td style={styles.td}>{user.is_active ? 'Yes' : 'No'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};


// Định nghĩa CSS dưới dạng một object
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: '420px',
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
        marginRight: '220px', // Dành chỗ cho sidebar
        padding: '20px',
        width: 'calc(100% - 220px)',
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
        borderCollapse: 'collapse',
    },
    th: {
        borderBottom: '2px solid #ddd',
        padding: '8px',
        textAlign: 'left', // Căn trái cho tiêu đề cột
    },
    td: {
        padding: '8px',
        borderBottom: '1px solid #ddd',
        textAlign: 'left', // Căn trái cho dữ liệu cột
    },
};
export default AddModerator;
