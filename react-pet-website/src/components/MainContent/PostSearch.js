import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authAPI, endpoints } from '../../configs/APIs';
import defaultAvatar from '../../images/avatarModel.jpg';

const PostSearch = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [query, setQuery] = useState('');
    const { id } = useParams(); // Retrieve the post ID from route
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        if (id) {
            fetchPostDetails(id); // Fetch post details using the ID from the URL
        }
    }, [id]);



    const fetchPostDetails = async (postId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authAPI().get(endpoints.detail_post(postId));
            setSelectedPost(response.data); // Store the post details in selectedPost
            console.log("Post data: ", response.data);
        } catch (err) {
            setError('Error fetching post details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };




    function timeSince(date) {
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
    }

    const handleCommentChange = (e) => setComment(e.target.value);

    const handleCommentSubmit = async () => {
        if (!comment) return;
        setLoading(true);
        try {
            const response = await authAPI().post(endpoints.add_comment(post.id), {
                comment
            });
            setComments([...comments, response.data]); // Update with new comment
            setComment('');
        } catch (err) {
            setError('Error adding comment.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await authAPI().delete(endpoints.delete_comment(commentId));
            setComments(comments.filter(comment => comment.id !== commentId));
        } catch (err) {
            console.error('Error deleting comment:', err);
        }
    };

    const handleImageClick = () => setIsZoomed(!isZoomed);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!post) return <p>Loading...</p>;

    return (
        <div style={styles.postContainer}>
            <div style={styles.postContent}>
                <span style={styles.highlightText}>Bài viết của {post.user?.first_name || ''} {post.user?.last_name || ''}</span>
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
                    <div style={styles.imageContainer}>
                        <img src={post.images[0]?.image || defaultAvatar} alt="Post Image" />
                    </div>
                )}
            </div>
            <div style={styles.commentsSection}>
                <span style={{ fontWeight: 'bold' }}>Có {comments.length} bình luận</span>
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
                            {comment.user.id === post.user.id && (
                                <button style={styles.modalButton} onClick={() => handleDeleteComment(comment.id)}>Xóa comment</button>
                            )}
                        </div>
                    ))
                ) : (
                    <p>Chưa có bình luận nào!!</p>
                )}
            </div>

            <div style={styles.commentInputSection}>
                <img src={post.user.avatar || defaultAvatar} alt="User Avatar" style={styles.userAvatar} />
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
        border: '1px solid #ddd',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    postContent: {
        marginBottom: '20px',
    },
    highlightText: {
        fontWeight: 'bold',
        fontSize: '18px',
        color: '#333',
        display: 'block',
        marginBottom: '10px',
    },
    userHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
    },
    userAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        marginRight: '10px',
        objectFit: 'cover',
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    userName: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
    },
    timeSince: {
        fontSize: '12px',
        color: '#888',
    },
    paragraph: {
        fontSize: '16px',
        color: '#444',
        lineHeight: '1.5',
        marginBottom: '20px',
    },
    imageContainer: {
        position: 'relative',
        textAlign: 'center',
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
    },
    commentsSection: {
        marginTop: '20px',
        borderTop: '1px solid #eee',
        paddingTop: '15px',
    },
    comment: {
        marginBottom: '15px',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px',
    },
    userInfoContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    commentBox: {
        paddingLeft: '50px',
        paddingTop: '5px',
        color: '#333',
        fontSize: '15px',
    },
    modalButton: {
        backgroundColor: '#ff4d4f',
        color: '#fff',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    commentInputSection: {
        display: 'flex',
        alignItems: 'center',
        marginTop: '15px',
    },
    commentInput: {
        flex: 1,
        padding: '8px',
        borderRadius: '20px',
        border: '1px solid #ddd',
        marginRight: '10px',
        outline: 'none',
    },
    commentButton: {
        padding: '8px 16px',
        backgroundColor: '#3b5998',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
};


export default PostSearch;
