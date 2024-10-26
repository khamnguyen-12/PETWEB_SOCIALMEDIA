import React, { useEffect, useState, useContext, useRef } from 'react';
import { MyUserContext, MyDispatchContext } from '../../configs/MyContext';
import { useNavigate } from 'react-router-dom';
import cookie from 'react-cookies';
import { authAPI, endpoints } from '../../configs/APIs';
import defaultCover from '../../images/cover.jpeg';
import defaultAvatar from '../../images/avatarModel.jpg';
import likeIcon from '../../images/love.png';  // Biểu tượng Yêu thích
import commentIcon from '../../images/comment.png';  // Biểu tượng Bình luận
import reportPNG from '../../images/exclamation.png';
import { jsx, css } from '@emotion/react';
import earthPost1 from '../../images/earthPost1.png';
import heart from '../../images/heart.gif';
import likeGif from '../../images/like.gif';
import sadGif from '../../images/sad.gif';
import laughGif from '../../images/laugh.gif';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [showLogout, setShowLogout] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [updatedData, setUpdatedData] = useState({});
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const navigate = useNavigate();
    const logoutRef = useRef();
    const [userPosts, setUserPosts] = useState([]);
    const [modalImage, setModalImage] = useState(null); // State cho hình ảnh được phóng to
    const [newAvatar, setNewAvatar] = useState(null);
    const [newCoverImage, setNewCoverImage] = useState(null);
    const [loading, setLoading] = useState(false); // Trạng thái loading
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            fetchUserData();
            fetchUserPosts();
        }
    }, [user, navigate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (logoutRef.current && !logoutRef.current.contains(event.target)) {
                setShowLogout(false);
            }
        };

        window.addEventListener('click', handleClickOutside);

        return () => {
            window.removeEventListener('click', handleClickOutside);
        };


    }, []);

    const fetchUserData = async () => {
        try {
            const response = await authAPI().get(endpoints['current_user']);
            setUserData(response.data);
            setUpdatedData({
                first_name: response.data.first_name,
                last_name: response.data.last_name,
                gender: response.data.gender,
                note: response.data.note,
                date_of_birth: response.data.date_of_birth,
            });

        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const fetchUserPosts = async () => {
        try {
            const response = await authAPI().get(endpoints['user_post']);
            setUserPosts(response.data);
        } catch (error) {
            console.error("Error fetching user posts:", error);
        }
    };

    const handleLogout = () => {
        dispatch({ type: 'logout' });
        navigate('/login');
    };

    const toggleLogout = () => {
        setShowLogout(!showLogout);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUpdatedData({ ...updatedData, [name]: value });
    };

    const handleSave = async () => {
        try {
            await authAPI().patch(endpoints['patch_profile'](userData.id), updatedData);
            setIsEditing(false);
            fetchUserData(); // Refresh the user data
        } catch (error) {
            console.error("Error updating user data:", error);
        }
    };
    const handleAvatarChange = (event) => {
        setNewAvatar(event.target.files[0]);
    };

    const handleCoverImageChange = (event) => {
        setNewCoverImage(event.target.files[0]);
    };


    // Hàm mở modal khi nhấn vào ảnh
    const handleImageClick = (imageUrl) => {
        setModalImage(imageUrl);
    };

    // Hàm đóng modal
    const handleCloseModal = () => {
        setModalImage(null);
    };
    const handleChangeImage = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setModalImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };


    const handleUpdateAvatar = async (userId) => {
        const formData = new FormData();

        if (newAvatar) formData.append('avatar', newAvatar);
        if (newCoverImage) formData.append('cover_image', newCoverImage);

        try {
            setLoading(true);

            console.log("User ID:", userId);
            console.log("FormData entries:", Array.from(formData.entries()));

            const response = await authAPI().patch(endpoints.patch_profile(userId), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log("Response Status:", response.status);
            console.log("Response Data:", response.data);
            alert('Cập nhật avatar thành công!');
        } catch (error) {
            console.error('Lỗi cập nhật avatar:', error.response?.data || error.message);

            if (error.response) {
                console.log("Error Status:", error.response.status);
                console.log("Error Data:", error.response.data);
            } else {
                console.log("Error Message:", error.message);
            }
            alert('Có lỗi xảy ra khi cập nhật ảnh.');
        } finally {
            setLoading(false);
        }
    };


    if (!userData) {
        return <div style={styles.loading}>Loading...</div>;
    }


    const formatTimeAgo = (time) => {
        const diff = Math.floor((new Date() - new Date(time)) / 1000);
        if (diff < 60) return `${diff} giây trước`;
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        return `${Math.floor(diff / 86400)} ngày trước`;
    };

    const handleCommentClick = (postId) => {
        setSelectedPost(postId);
        navigate(`/post/${postId}/comments`); // Chuyển hướng đến trang comment
    };

    const handleReactPost = async (postId, type) => {
        try {
            const response = await authAPI().post(endpoints.react_post(postId), { type });
            console.log(response.data);
            console.log(response.status);
            console.log(response.data);

            const updatedPosts = posts.map(post => {
                if (post.id === postId) {
                    let newReactions = { ...post.reactions }; // Copy object reactions
                    const previousReaction = post.userReaction;

                    // Nếu người dùng đã thả `react` trước đó
                    if (previousReaction) {
                        newReactions[previousReaction] -= 1; // Giảm số lượng của `react` cũ
                    }

                    // Nếu người dùng không bỏ `react` mà chuyển sang thả `react` mới
                    if (previousReaction !== type) {
                        newReactions[type] = (newReactions[type] || 0) + 1; // Tăng số lượng của `react` mới
                    }

                    return {
                        ...post,
                        userReaction: previousReaction === type ? null : type, // Cập nhật kiểu `react` người dùng
                        reactions: newReactions // Cập nhật số lượng `react`
                    };
                }
                return post;
            });

            setPosts(updatedPosts);
        } catch (error) {
            console.error('Failed to react to post:', error);
        }
    };


    const openModal = (postId) => {
        console.log('PostID bài post được chọn :', postId)
        // Chuyển hướng đến trang báo cáo với ID của bài viết
        navigate(`/report/${postId}`);
    };

    const getReactionIcon = (type) => {
        switch (type) {
            case 1:
                return likeGif; // Hoặc biểu tượng tương ứng với type 1
            case 2:
                return laughGif; // Hoặc biểu tượng tương ứng với type 2
            case 3:
                return heart; // Hoặc biểu tượng tương ứng với type 3
            case 4:
                return sadGif; // Hoặc biểu tượng tương ứng với type 4
            default:
                return likeIcon; // Biểu tượng mặc định
        }
    };
    return (
        <div style={styles.profileContainer}>
            {/* Modal hiển thị hình ảnh được phóng to */}
            {modalImage && (
                <div style={styles.modalOverlay} onClick={handleCloseModal}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <img src={modalImage} alt="Modal Image" style={styles.modalImage} />
                        <input
                            type="file"
                            onChange={handleChangeImage}
                            style={styles.fileInput}
                        />
                        {/* <button style={styles.updateButton} onClick={handleUpdateAvatar}>
                            Đổi ảnh
                        </button> */}
                        <button onClick={() => handleUpdateAvatar(userData.id)}>Cập nhật ảnh</button>

                        <button style={styles.closeButton} onClick={handleCloseModal}>Đóng</button>
                    </div>
                </div>
            )}

            <div style={styles.profileHeader}>
                <img
                    src={userData.cover_image || defaultCover}
                    alt="Cover"
                    style={styles.coverImage}
                    onClick={() => handleImageClick(userData.cover_image || defaultCover)} // Sự kiện nhấn vào ảnh bìa
                />
                <div style={styles.avatarContainer}>
                    <img
                        src={userData.avatar || defaultAvatar}
                        alt="Avatar"
                        style={styles.avatarImage}
                        onClick={() => handleImageClick(userData.avatar || defaultAvatar)} // Sự kiện nhấn vào avatar
                    />

                    <input type="file" onChange={handleAvatarChange} />  {/* Dòng input để chọn avatar */}

                </div>
                <h2 style={styles.userName}>
                    {userData.first_name} {userData.last_name}
                </h2>
                <p style={styles.email}>" {userData.note} "</p>
            </div>

            <div style={styles.userMenu} onClick={toggleLogout} ref={logoutRef}>
                <img
                    src={userData.avatar || defaultAvatar}
                    alt="User Avatar"
                    style={styles.smallAvatar}
                />
                <span style={styles.userNameSmall}>
                    {userData.first_name} {userData.last_name}
                </span>
            </div>

            {showLogout && (
                <div style={styles.logoutOption} onClick={handleLogout}>
                    Đăng xuất
                </div>
            )}

            <div style={styles.profileDetails}>
                {isEditing ? (
                    <>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Họ:</label>
                            <input
                                type="text"
                                name="first_name"
                                value={updatedData.first_name}
                                onChange={handleInputChange}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Tên:</label>
                            <input
                                type="text"
                                name="last_name"
                                value={updatedData.last_name}
                                onChange={handleInputChange}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Giới tính:</label>
                            <select
                                name="gender"
                                value={updatedData.gender}
                                onChange={handleInputChange}
                                style={styles.input}
                            >
                                <option value={1}>Nam</option>
                                <option value={2}>Nữ</option>
                                <option value={3}>Khác</option>
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Ngày sinh:</label>
                            <input
                                type="date"
                                name="date_of_birth"
                                value={updatedData.date_of_birth}
                                onChange={handleInputChange}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Ghi chú:</label>
                            <textarea
                                name="note"
                                value={updatedData.note}
                                onChange={handleInputChange}
                                style={styles.textarea}
                            />
                        </div>
                        <button style={styles.saveButton} onClick={handleSave}>
                            Lưu cập nhật
                        </button>
                    </>
                ) : (
                    <>
                        {/* <h3 style={styles.detailItem}><strong>Ghi chú:</strong> {userData.note || "Không có ghi chú"}</h3> */}
                        <h3 style={styles.detailItem}><strong>Bạn sinh vào:</strong> {new Date(userData.date_of_birth).toLocaleDateString()}</h3>
                        <h3 style={styles.detailItem}><strong>Giới tính:</strong> {getGenderName(userData.gender)}</h3>
                        {/* <h3 style={styles.detailItem}><strong>Tham gia vào:</strong> {new Date(userData.date_joined).toLocaleDateString()}</h3> */}


                        <button style={styles.editButton} onClick={handleEdit}>
                            Cập nhật trang cá nhân
                        </button>
                    </>
                )}
            </div>
            <div style={styles.pageContainer}>
                <div style={styles.mainContent}>
                    <div style={styles.postsContainer}>
                        <h3 style={styles.sectionTitle}>Bài viết của bạn</h3>
                        {userPosts.length > 0 ? (
                            userPosts.map((post) => (
                                <div key={post.id} style={styles.postCard}>
                                    <div style={styles.postHeader}>
                                        <img
                                            src={userData.avatar || defaultAvatar}
                                            alt="Avatar"
                                            style={styles.postAvatar}
                                        />
                                        <div>
                                            <p style={styles.postUserName}>{userData.first_name} {userData.last_name}</p>
                                            <div css={styles.dateAndEarth}>
                                                <p css={styles.postTime}>{formatTimeAgo(post.created_date)}</p>

                                                {/* <img src={earthPost1} css={styles.earthPost} /> */}
                                            </div>
                                        </div>
                                    </div>
                                    <p>{post.content}</p>
                                    {post.images && post.images.map((image) => (
                                        <img key={image.id} src={image.image} alt="Post Image" style={styles.postImage} />
                                    ))}
                                    {post.videos && post.videos.map((video) => (
                                        <video key={video.id} controls style={styles.postVideo}>
                                            <source src={video.video} type="video/mp4" />
                                            Trình duyệt của bạn không hỗ trợ video.
                                        </video>
                                    ))}

                                    <div style={styles.separator} /> {/* Đường kẻ ngăn cách */}

                                    <div style={styles.postActions}>
                                        <div style={styles.actionGroup} onClick={() => handleReactPost(post.id, 3)}>
                                            <img src={likeIcon} alt="Reaction" style={styles.actionIcon} />
                                            {/* <span>{getReactionText(post.userReaction)}</span> */}
                                            <span>Yêu thích</span>
                                        </div>

                                        <div style={styles.actionGroup} onClick={() => handleCommentClick(post.id)}>
                                            <img src={commentIcon} alt="Comment" style={styles.actionIcon} />
                                            <span>Bình luận</span>
                                        </div>
                                        {/* Nút Báo cáo */}
                                        <div style={styles.actionGroup} onClick={() => openModal(post.id)}>
                                            <img src={reportPNG} alt="Report" style={styles.actionIcon} />
                                            <span>Báo cáo</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Bạn chưa có bài viết nào.</p>
                        )}
                    </div>

                    {/* Bên phải: Ảnh và Kênh theo dõi */}
                    <div style={styles.sidebar}>
                        {/* Cột giữa: Ảnh đã đăng */}
                        <div style={styles.mediaContainer}>
                            <h3 style={styles.sectionTitle}>Ảnh đã đăng</h3>
                            {/* Danh sách ảnh */}
                            <div style={styles.mediaGallery}>
                                {userPosts.length > 0 && userPosts.map((post) => (
                                    post.images && post.images.map((image) => (
                                        <img key={image.id} src={image.image} alt="Posted Image" style={styles.mediaImage} />
                                    ))
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

const getGenderName = (gender) => {
    switch (gender) {
        case 1:
            return 'Nam';
        case 2:
            return 'Nữ';
        case 3:
            return 'Khác';
        default:
            return 'Không xác định';
    }
};

const getReactionText = (type) => {
    switch (type) {
        case 1:
            return 'Thích'; // Hoặc văn bản tương ứng với type 1
        case 2:
            return 'Haha'; // Hoặc văn bản tương ứng với type 2
        case 3:
            return 'Yêu thích'; // Hoặc văn bản tương ứng với type 3
        case 4:
            return 'Buồn'; // Hoặc văn bản tương ứng với type 4
        default:
            return 'Yêu thích'; // Văn bản mặc định
    }
};

const styles = {


    separator: {
        width: '100%', // Độ rộng của đường kẻ
        height: '1px', // Độ dày của đường kẻ
        backgroundColor: '#ccc', // Màu sắc của đường kẻ
        margin: '30px 0', // Khoảng cách phía trên và dưới đường kẻ
    },
    reactIcon: {
        width: '16px', // Kích thước nhỏ hơn
        height: '16px', // Kích thước nhỏ hơn
        marginRight: '5px', // Khoảng cách giữa biểu tượng và văn bản
    }
    ,
    reactIcons: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // Canh giữa các icon
        gap: '10px' // Khoảng cách giữa các icon
    }
    ,
    heartAnimation: {
        position: 'absolute',
        top: '-50px',
        left: '20%',
        backgroundColor: 'white',
        padding: '5px 10px',
        borderRadius: '43%', // Làm cho nền tròn
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        opacity: 0,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Hiển thị khi hover lên icon
        ':hover': {
            opacity: 1, // Hiện ra khi hover
            pointerEvents: 'auto' // Cho phép tương tác với các icon
        }
    },


    actionGroup: {
        // position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between', // Căn giữa các nút theo chiều ngang
    },


    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        position: 'relative',
    },
    modalImage: {
        maxWidth: '100%',
        maxHeight: '400px',
    },
    closeButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'red',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '5px 10px',
        cursor: 'pointer',
    },
    fileInput: {
        margin: '10px 0',
    },
    updateButton: {
        background: 'green',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '5px 10px',
        cursor: 'pointer',
    },
    pageContainer: {
        width: '100%',
        overflow: 'hidden', // Đảm bảo không có nội dung nào tràn ra ngoài
    },

    mainContent: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '20px',
    },

    postsContainer: {
        width: '65%',
        maxWidth: '100%',
        boxSizing: 'border-box',
    },





    mediaGallery: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '10px',
    },

    mediaImage: {
        width: '100%',
        height: '100px',
        objectFit: 'cover',
        borderRadius: '10px',
    },
    followingContainer: { backgroundColor: '#fff', padding: '15px', borderRadius: '10px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', marginTop: '30px' },
    followingList: { listStyleType: 'none', paddingLeft: '0', fontSize: '16px' },
    postCard: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid #ddd',
        overflow: 'hidden', // Ẩn nội dung vượt quá
    },

    postHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px'
    },

    postAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        marginRight: '10px'
    },

    postUserName: {
        fontWeight: 'bold',
        marginBottom: '1px' // Giảm khoảng cách giữa tên và ngày tạo
    }
    ,
    postTime: {
        color: 'gray',
        fontSize: '14px',
        margin: '0', // Xóa khoảng cách bên ngoài để sát với tên người dùng
        display: 'flex', // Đảm bảo text căn giữa theo chiều dọc nếu cần
        alignItems: 'center'
    },

    earthPost: {
        width: '12px', // Thu nhỏ hơn để vừa với ngày đăng
        height: '12px',
        marginLeft: '5px', // Khoảng cách giữa biểu tượng và ngày đăng
        objectFit: 'contain' // Giữ nguyên tỉ lệ ảnh
    },

    dateAndEarth: {
        display: 'flex',
        alignItems: 'center' // Căn giữa theo chiều dọc
    }
    ,
    postImage: {
        maxWidth: '100%',
        height: 'auto', // Tự động điều chỉnh chiều cao dựa trên chiều rộng
        borderRadius: '10px',
        marginTop: '10px',
        objectFit: 'cover', // Đảm bảo ảnh không bị méo
    },

    postVideo: {
        maxWidth: '100%',
        height: 'auto',
        borderRadius: '10px',
        marginTop: '10px',
    },
    postActions: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    actionIcon: {
        width: '20px', // Kích thước nhỏ hơn
        height: '20px', // Kích thước nhỏ hơn
        marginRight: '5px', // Khoảng cách giữa biểu tượng và văn bản
    },
    profileContainer: { marginLeft: '260px', marginTop: '50px', padding: '20px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff', borderRadius: '10px' },
    profileHeader: { textAlign: 'center', position: 'relative', marginBottom: '50px' },
    coverImage: { width: '90%', height: '250px', objectFit: 'cover', borderRadius: '10px 10px 0 0' },
    avatarContainer: { position: 'absolute', top: '200px', left: '50%', transform: 'translateX(-50%)', width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '5px solid #fff', backgroundColor: '#eee' },
    avatarImage: { width: '100%', height: '100%', objectFit: 'cover' },
    userName: { marginTop: '100px', fontSize: '28px', color: '#333' },
    email: { color: '#666', fontSize: '18px', marginTop: '10px', fontStyle: 'italic' },
    profileDetails: { textAlign: 'left', marginTop: '20px', padding: '0 20px' },
    detailItem: { color: '#333', marginBottom: '10px' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
    input: { width: '100%', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd' },
    textarea: { width: '100%', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd', minHeight: '100px' },
    saveButton: { backgroundColor: '#4CAF50', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' },
    editButton: { backgroundColor: '#008CBA', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' },
    userMenu: { display: 'flex', alignItems: 'center', position: 'absolute', top: '10px', right: '20px', backgroundColor: '#ddd', borderRadius: '15px', padding: '10px', cursor: 'pointer' },
    smallAvatar: { width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' },
    userNameSmall: { fontSize: '16px' },
    logoutOption: { position: 'absolute', top: '60px', right: '10px', backgroundColor: '#f44336', color: '#fff', padding: '10px', borderRadius: '5px', cursor: 'pointer', zIndex: 1000 },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        position: 'relative',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
    },
    modalImage: {
        maxWidth: '90vw',
        maxHeight: '80vh',
        objectFit: 'contain',
    },
    closeButton: {
        marginTop: '10px',
        padding: '10px 20px',
        backgroundColor: '#f44336',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },

};


export default Profile;
