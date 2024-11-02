import React, { useEffect, useState, useContext, useRef } from 'react';
import { MyUserContext, MyDispatchContext } from '../../configs/MyContext';
import { useNavigate } from 'react-router-dom';
import { authAPI, endpoints } from '../../configs/APIs';
import defaultCover from '../../images/cover.jpeg';
import defaultAvatar from '../../images/avatarModel.jpg';
import likeIcon from '../../images/love.png';  // Biểu tượng Yêu thích
import commentIcon from '../../images/comment.png';  // Biểu tượng Bình luận
import reportPNG from '../../images/exclamation.png';


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


    const [loading, setLoading] = useState(false); // Trạng thái loading
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const fileInputRef = useRef(null); // Dùng useRef để tham chiếu đến input file

    const [coverImageModal, setCoverImageModal] = useState(null); // State cho modal ảnh bìa
    const [newCoverImage, setNewCoverImage] = useState(null);
    const [previewCoverImage, setPreviewCoverImage] = useState(null);


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
        const file = event.target.files[0];
        if (file) {
            const newImageURL = URL.createObjectURL(file);
            setModalImage(newImageURL); // Cập nhật modalImage bằng ảnh vừa chọn
            setNewAvatar(file); // Lưu file ảnh để sử dụng cho việc cập nhật avatar
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setNewCoverImage(file);

        // Tạo preview ảnh bằng FileReader
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewCoverImage(reader.result);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };


    const handleCoverImageClick = (image) => {
        setModalImage(image);
        setCoverImageModal(true);
    };



    // Hàm mở modal khi nhấn vào ảnh
    const handleImageClick = (imageUrl) => {
        setModalImage(imageUrl);
    };

    // Hàm đóng modal
    const handleCloseModal = () => {
        setModalImage(null);
        setNewAvatar(null); // Đặt lại newAvatar về null để ẩn nút Cập nhật avatar

    };

    const handleCloseModalCoverImage = () => {
        setCoverImageModal(null);
        setNewCoverImage(null);
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
        if (newCoverImage) formData.append('cover_image', newCoverImage); // Thêm cover_image nếu có

        try {
            setLoading(true);

            console.log("User ID:", userId);
            console.log("FormData entries:", Array.from(formData.entries()));

            const response = await authAPI().patch(endpoints.patch_profile(userId), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status == 200) {
                setModalImage(null);
                alert('Cập nhật avatar thành công!')
            }

            console.log("Response Status:", response.status);
            console.log("Response Data:", response.data);
            ;

            fetchUserData();


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




    const handleUpdateCoverImage = async (userId) => {
        const formData = new FormData();
        if (newCoverImage) formData.append('cover_image', newCoverImage);

        try {
            setLoading(true);
            const response = await authAPI().patch(endpoints.patch_profile(userId), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });



            setCoverImageModal(null);
            setNewCoverImage(null);
            alert('Cập nhật ảnh bìa thành công!');


            console.log("Response Status:", response.status);
            console.log("Response Data:", response.data);


            fetchUserData();
        } catch (error) {
            console.error('Lỗi cập nhật ảnh bìa:', error.response?.data || error.message);
            alert('Có lỗi xảy ra khi cập nhật ảnh bìa.');
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

    return (
        <div style={styles.profileContainer}>
            {/* Modal hiển thị hình ảnh được phóng to */}
            {modalImage && (
                <div style={styles.modalOverlay} onClick={handleCloseModal}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <img src={modalImage} alt="Modal Image" style={styles.modalImage} />


                        <div style={styles.functAvatar}>
                            {/* Input chọn ảnh avatar */}
                            <input
                                type="file"
                                onChange={handleAvatarChange}
                                style={{ display: 'none' }} // Ẩn input file
                                ref={fileInputRef} // Thêm ref để truy cập input từ nút
                            />

                            {/* Nút chọn ảnh avatar */}
                            <button
                                style={styles.selectButton} // Thêm style cho nút
                                onClick={() => fileInputRef.current.click()} // Mở input khi nhấn nút
                            >
                                Chọn ảnh mới
                            </button>

                            {/* Chỉ hiện nút cập nhật avatar khi đã chọn ảnh avatar */}
                            {newAvatar && (
                                <button onClick={() => handleUpdateAvatar(userData.id)}
                                    style={styles.updateAvatar}>Cập nhật avatar</button>
                            )}


                        </div>
                        <button style={styles.closeButton} onClick={handleCloseModal}>Đóng</button>
                    </div>
                </div>
            )}


            {coverImageModal && (
                <div style={styles.modalOverlay} onClick={() => setCoverImageModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        {/* Hiển thị ảnh đã chọn hoặc ảnh hiện tại */}
                        <img src={previewCoverImage || modalImage} alt="Cover Image" style={styles.modalImage} />

                        <div style={styles.functCover}>
                            {/* Input chọn ảnh bìa */}
                            <input
                                type="file"
                                onChange={handleFileChange}
                                style={{ display: 'none' }} // Ẩn input file
                                ref={fileInputRef}
                            />

                            {/* Nút chọn ảnh bìa */}
                            <button
                                style={styles.selectButton}
                                onClick={() => fileInputRef.current.click()}
                            >
                                Chọn ảnh mới
                            </button>

                            {/* Nút cập nhật ảnh bìa khi đã chọn */}
                            {newCoverImage && (
                                <button onClick={() => handleUpdateCoverImage(userData.id)}
                                    style={styles.updateCoverImage}>
                                    Cập nhật ảnh bìa
                                </button>
                            )}
                        </div>

                        <button style={styles.closeButton} onClick={handleCloseModalCoverImage}>Đóng</button>
                    </div>
                </div>
            )}

            <div style={styles.profileHeader}>
                <img
                    src={userData.cover_image || defaultCover}
                    alt="Cover"
                    style={styles.coverImage}
                    onClick={() => handleCoverImageClick(userData.cover_image || defaultCover)} // Sự kiện nhấn vào ảnh bìa
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


    updateCoverImage: {
        backgroundColor: '#FF6600', // Màu nền của nút
        color: 'white', // Màu chữ
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        margin: '10px',
        height: '44px',
    },

    updateAvatar:
    {
        backgroundColor: '#FF6600', // Màu nền của nút
        color: 'white', // Màu chữ
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        margin: '10px',
        height: '44px',
    },

    functAvatar: {
        display: 'flex'
    },
    selectButton: {
        backgroundColor: '#4CAF50', // Màu nền của nút
        color: 'white', // Màu chữ
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '10px',
        width: '150px', // Đặt độ rộng cố định cho nút
        textAlign: 'center',
        maxHeight: '44px'
    },



    sidebar: {
        // paddingRight: '160px'
    },


    mediaContainer: {

    },

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
        gridTemplateColumns: 'repeat(3, 1fr)', // Cố định 3 ảnh mỗi hàng
        gap: '10px',
        border: '1px solid gray',
        borderRadius: '3px',
        minHeight: '200px', // Chiều cao tối thiểu cho mediaGallery
        padding: '10px', // Khoảng trống bên trong để mở rộng vùng viền
    },

    mediaImage: {
        width: '100%', // Để ảnh chiếm hết ô lưới
        height: '90px', // Chiều cao cố định cho mỗi ảnh
        objectFit: 'cover', // Cắt ảnh để vừa với khung mà không biến dạng
        borderRadius: '3px', // Tùy chọn để làm mềm góc ảnh
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
    coverImage: { width: '90%', height: '250px', objectFit: 'cover', borderRadius: '10px 10px 0 0', cursor: 'pointer' },
    avatarContainer: { position: 'absolute', top: '200px', left: '50%', transform: 'translateX(-50%)', width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '5px solid #fff', backgroundColor: '#eee' },
    avatarImage: { width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' },
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
        padding: '15px',
        borderRadius: '10px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        width: '500px', // Điều chỉnh chiều rộng của modal để thu nhỏ
        maxWidth: '90%', // Đảm bảo modal không vượt quá màn hình trên thiết bị nhỏ
    },

    modalImage: {
        width: '100%', // Đặt kích thước ảnh vừa với modal
        maxWidth: '300px', // Giới hạn chiều rộng tối đa của ảnh để ảnh nhỏ gọn hơn
        height: 'auto', // Giữ tỉ lệ của ảnh
        borderRadius: '8px', // Làm tròn ảnh nhẹ nhàng hơn 
        margin: '50px 100px',
    },


};


export default Profile;
