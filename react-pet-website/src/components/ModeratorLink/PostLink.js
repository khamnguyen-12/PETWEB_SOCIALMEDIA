import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import defaultAvatar from '../../images/avatarModel.jpg';
import { authAPI, endpoints } from "../../configs/APIs";

const PostLink = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [comment, setComment] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    const avatarCMtBar = currentUser?.avatar || defaultAvatar;

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const userResponse = await authAPI().get(endpoints.current_user);
                setCurrentUser(userResponse.data);
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };

        const fetchPostAndComments = async () => {
            try {
                const postResponse = await authAPI().get(endpoints.detail_post(postId));
                setPost(postResponse.data);

                const commentsResponse = await authAPI().get(endpoints.list_comments(postId));
                setComments(commentsResponse.data);
            } catch (error) {
                console.error('Error fetching post and comments:', error);
                if (error.response) {
                    console.error('Error Response Data:', error.response.data);
                }
            }
        };

        fetchCurrentUser();
        if (postId) {
            fetchPostAndComments();
        }
    }, [postId]);

    if (!post || !currentUser) return <div>Loading...</div>;

    const handleCommentChange = (event) => {
        setComment(event.target.value);
    };

    const handleCommentSubmit = async () => {
        if (!comment.trim()) {
            setError('Bạn muốn comment gì thế, bạn tôi?.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await authAPI().post(`/comments/${postId}/add-comment/`, { comment });
            setComments([...comments, response.data]);
            setComment('');
        } catch (err) {
            console.error('Error submitting comment:', err.response?.data || err.message);
            setError('Đã xảy ra lỗi khi gửi bình luận. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const response = await authAPI().post(endpoints.delete_cmt(commentId));
            if (response.status === 200) {
                setComments(comments.map(comment =>
                    comment.id === commentId ? { ...comment, active: false } : comment
                ));
                window.location.reload();
            }
        } catch (error) {
            console.error('Error hiding comment:', error.response?.data || error.message);
        }
    };

    const timeSince = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) return interval + " năm trước";
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return interval + " tháng trước";
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return interval + " ngày trước";
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return interval + " giờ trước";
        interval = Math.floor(seconds / 60);
        if (interval >= 1) return interval + " phút trước";
        return Math.floor(seconds) + " giây trước";
    };

    return (
        <div style={styles.postContainer}>
            <div style={styles.postContent}>
                <span style={styles.highlightText}>Bài viết của {post.user.first_name} {post.user.last_name}</span>
                <div style={styles.userHeader}>
                    <img
                        src={post.user.avatar || defaultAvatar}
                        alt="Avatar"
                        style={styles.userAvatar}
                    />
                    <div style={styles.userInfo}>
                        <h2 style={styles.userName}>{post.user.first_name} {post.user.last_name}</h2>
                        <p style={styles.timeSince}>{timeSince(post.created_date)}</p>
                    </div>
                </div>
                <p style={styles.paragraph}>{post.content}</p>
                {post.images && post.images.length > 0 && (
                    <img src={post.images[0].image} alt="Post Image" style={styles.postImage} />
                )}
            </div>

            <div style={styles.commentsSection}>
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} style={styles.comment}>
                            <div style={styles.userHeader}>
                                <img src={comment.user.avatar} alt="Avatar" style={styles.userAvatar} />
                                <div style={styles.userInfoContainer}>
                                    <div style={styles.userInfo}>
                                        <p style={styles.userName}>{comment.user.first_name} {comment.user.last_name}</p>
                                        <p style={styles.timeSince}>{timeSince(comment.created_date)}</p>
                                    </div>
                                    <div style={styles.commentBox}>
                                        <p>{comment.comment}</p>
                                    </div>
                                </div>
                            </div>
                            <p style={styles.commentText}>{comment.content}</p>
                            <div style={styles.commentActions}>
                                {comment.user.id === currentUser.id && (
                                    <button style={styles.modalButton} onClick={() => handleDeleteComment(comment.id)}>Xóa comment</button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No comments yet.</p>
                )}
            </div>

            <div style={styles.commentInputSection}>
                <img src={avatarCMtBar} alt="User Avatar" style={styles.userAvatar} />
                <input
                    type="text"
                    placeholder="Viết bình luận..."
                    value={comment}
                    onChange={handleCommentChange}
                    style={styles.commentInput}
                />
                <button
                    onClick={handleCommentSubmit}
                    style={styles.commentButton}
                    disabled={loading}
                >
                    {loading ? 'Đang gửi...' : 'Đăng'}
                </button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        </div>
    );
};

const styles = {
    postContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },

    commentsSection: {
        width: '100%',
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },

    comment: {
        position: 'relative',
        marginBottom: '10px',
        padding: '10px',
        borderBottom: '1px solid #eee',
    },

    commentText: {
        margin: '5px 0',
        color: '#555',
    },

    userHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px',
        marginLeft: '10px',
        position: 'relative',
    },

    userInfoContainer: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f0f0f0',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        width: '100%',
    },

    userInfo: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: '10px',
    },

    timeSince: {
        color: '#999',
        fontSize: '12px',
    },

    userAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        marginRight: '10px',
    },

    userName: {
        fontWeight: 'bold',
        color: '#333',
        margin: '0',
        fontSize: '16px',
        marginRight: '10px',
    },

    commentBox: {
        marginTop: '5px',
        padding: '8px',
        borderRadius: '8px',
        color: '#333',
    },

    commentActions: {
        display: 'flex',
        justifyContent: 'flex-end', // Căn các nút sang phải
        gap: '10px',
        marginTop: '10px',
    },

    modalButton: {
        backgroundColor: '#007bff',
        color: '#fff',
        padding: '5px 10px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },

    commentInputSection: {
        display: 'flex',
        alignItems: 'center',
        marginTop: '20px',
        width: '100%',
    },

    commentInput: {
        flexGrow: 1,
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        marginRight: '10px',
    },

    commentButton: {
        backgroundColor: '#007bff',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
};


export default PostLink;
