/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { useState, useEffect, useContext } from 'react';
import { MyDispatchContext, MyUserContext } from '../../configs/MyContext';
import { endpoints, authAPI } from "../../configs/APIs";
import { Link, useNavigate } from 'react-router-dom';
import happy from '../../images/happy.png';
import gallery from '../../images/gallery.png';
import food from '../../images/food.png';
import defaultAvatar from '../../images/avatarModel.jpg';
import likeIcon from '../../images/love.png';
import commentIcon from '../../images/comment.png';
import shareIcon from '../../images/send.png';
import heart from '../../images/heart.gif';
import likeGif from '../../images/like.gif';
import sadGif from '../../images/sad.gif';
import laughGif from '../../images/laugh.gif';


const MainContent = () => {
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const user = useContext(MyUserContext);
    const [filteredResults, setFilteredResults] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const navigate = useNavigate();
    const [reactions, setReactions] = useState({});
    const [commentCounts, setCommentCounts] = useState([]);

    const handleCommentClick = (postId) => {
        setSelectedPost(postId);
        navigate(`/post/${postId}/comments`); // Chuyển hướng đến trang comment
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await authAPI().get(endpoints['newest_post']);
                console.log("Newest posts response:", response);
                const postsData = response.data.results;
                setPosts(postsData);


                // Lấy tất cả phản ứng của các bài viết trong một lần gọi API duy nhất
                const postIds = postsData.map(post => post.id).join(',');
                const reactionResponse = await authAPI().get(endpoints['list_react'], {
                    params: { post_ids: postIds }
                });

                console.log("Reactions data:", reactionResponse);

                // Tổ chức lại dữ liệu phản ứng theo post_id
                const reactionsData = reactionResponse.data.reduce((acc, reaction) => {
                    const postId = reaction.post;
                    if (!acc[postId]) acc[postId] = [];
                    acc[postId].push(reaction);
                    return acc;
                }, {});

                setReactions(reactionsData);


                // Fetch comment counts for the posts
                const commentResponse = await authAPI().get(endpoints['list_comments'], {
                    params: { post_ids: postIds }
                });
                console.log("Comments API response:", commentResponse); // Log raw API response
                console.log("Comments data:", commentResponse.data); // Log extracted data

                // Organize comments by post_id and extract count
                const commentsData = commentResponse.data.reduce((acc, comment) => {
                    const postId = comment.post;
                    if (!acc[postId]) acc[postId] = 0;
                    acc[postId] += 1;  // Increment comment count for each post
                    return acc;
                }, {});
                setCommentCounts(commentsData);
                console.log("Comments count data by post ID:", commentsData); // Log organized comment count data

                // Attach commentCount to each post
                const updatedPosts = postsData.map(post => ({
                    ...post,
                    commentCount: commentsData[post.id] || 0 // Attach the comment count
                }));
                console.log("Updated posts with comment counts:", updatedPosts); // Log updated posts with comment counts

                setPosts(updatedPosts);

            } catch (error) {
                console.error("Failed to fetch posts or reactions:", error);
            }
        };


        fetchPosts();
    }, []);



    if (!user) {
        return <p>Please log in to view this content.</p>;
    }

    const handleIconClick = () => {
        document.getElementById("fileInput").click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
            setImageFile(file);
        }
    };

    const handlePostSubmit = async () => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('content', content);
        if (imageFile) {
            formData.append('images', imageFile);
        }

        try {
            const response = await authAPI().post(endpoints.create_post, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setPosts([response.data, ...posts]);
            setIsModalOpen(false);
            setContent('');
            setSelectedImage(null);
            setImageFile(null);
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 3000);
        } catch (error) {
            console.error('Failed to create post', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTimeAgo = (time) => {
        const diff = Math.floor((new Date() - new Date(time)) / 1000);
        if (diff < 60) return `${diff} giây trước`;
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        return `${Math.floor(diff / 86400)} ngày trước`;
    };

    const handleSearch = (event) => {
        const searchInput = event.target.value.toLowerCase();
        setSearchTerm(searchInput);

        if (searchInput) {
            const results = posts.filter(post => post.content.toLowerCase().includes(searchInput));
            setFilteredResults(results);
        } else {
            setFilteredResults([]);
        }
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


    const postsToDisplay = filteredResults.length > 0 ? filteredResults : posts;

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };
    const handleSearchResultClick = (post) => {
        // setSelectedPost(post);
        // setFilteredResults([]); // Ẩn kết quả tìm kiếm sau khi chọn

        navigate(`/post/${post.id}`, { state: { post } });


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



    return (
        <div css={styles.container}>
            {/* Các phần khác của return */}
            <div css={styles.newSearchBar}>
                <input
                    type="text"
                    placeholder="Tìm kiếm bài viết hoặc người dùng..."
                    value={searchTerm}
                    onChange={handleSearch}
                    css={styles.newSearchInput}
                />
            </div>

            {/* Kết quả tìm kiếm */}
            {filteredResults.length > 0 && (
                <div css={styles.searchResults}>
                    {filteredResults.map((post) => (
                        <div key={post.id} css={styles.resultItem} onClick={() => handleSearchResultClick(post)}>
                            <p>{post.content}</p>
                        </div>
                    ))}
                </div>
            )}
            {/* Thanh chia sẻ */}
            <div css={styles.sharePost} onClick={toggleModal}>
                <div css={styles.searchBar}>
                    <img src={user.avatar || defaultAvatar} alt="User Avatar" css={styles.avatar} />
                    <input
                        type="text"
                        placeholder={`${user.first_name} ${user.last_name}, đừng ngần ngại, hãy chia sẻ nhá!`}
                        css={styles.searchInput}
                    />
                    <div css={styles.iconContainer}>
                        <img src={gallery} alt="Gallery" css={styles.icon} />
                        <img src={happy} alt="Happy" css={styles.icon} />
                        <img src={food} alt="Food" css={styles.icon} />
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div css={styles.modalOverlay}>
                    <div css={styles.modalContent}>
                        <div css={styles.modalHeader}>
                            <h2>Tạo Bài Đăng</h2>
                            <span css={styles.closeButton} onClick={toggleModal}>&times;</span>
                        </div>
                        <div css={styles.modalBody}>
                            <div css={styles.userInfo}>
                                <img src={user.avatar || defaultAvatar} alt="User Avatar" css={styles.modalAvatar} />
                                <div>
                                    <p css={styles.userName}>{user.first_name} {user.last_name}</p>
                                    <p css={styles.userPrivacy}>Mọi người</p>
                                </div>
                            </div>
                            <textarea
                                css={styles.textArea}
                                placeholder="Nhập nội dung chia sẻ"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                            {selectedImage && <img src={selectedImage} alt="Selected" css={styles.modalImage} />}
                        </div>
                        <div css={styles.modalFooter}>
                            <div css={styles.modalIcons}>
                                <img src={gallery} alt="Gallery" css={styles.icon} onClick={handleIconClick} />
                                <img src={happy} alt="Happy" css={styles.icon} onClick={handleIconClick} />
                                <img src={food} alt="Food" css={styles.icon} onClick={handleIconClick} />
                                <input
                                    type="file"
                                    id="fileInput"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                            </div>
                            <button
                                className="submitButton"
                                onClick={handlePostSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Đang đăng...' : 'Đăng'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showNotification && (
                <div css={styles.notification}>
                    <p>Bài viết đã được đăng thành công!</p>
                </div>
            )}
            {/* Hiển thị bài viết được chọn */}
            {selectedPost ? (
                <div css={styles.postCard}>
                    <div css={styles.postHeader}>
                        <img src={user.avatar || defaultAvatar} alt="Avatar" css={styles.postAvatar} />
                        <div css={styles.userInfo}>
                            <p css={styles.postUserName}>{user.first_name} {user.last_name}</p>
                            <p css={styles.postTime}>{formatTimeAgo(selectedPost.created_at)}</p>
                        </div>
                    </div>
                    <p>{selectedPost.content}</p>
                    {selectedPost.images && selectedPost.images.map((image) => (
                        <>
                            <img key={image.id} src={image.image} alt="Post Image" css={styles.postImage} />
                            <div css={styles.dividerLine}></div> {/* Thêm đường line */}
                        </>
                    ))}
                    {selectedPost.videos && selectedPost.videos.map((video) => (
                        <video key={video.id} controls css={styles.postVideo}>
                            <source src={video.video} type="video/mp4" />
                        </video>
                    ))}
                    <div css={styles.postActions}>
                        <div css={styles.actionGroup} onClick={() => handleReactPost(selectedPost.id)}>
                            {/* Kiểm tra loại react của người dùng */}
                            {selectedPost.userReactType === 1 && (
                                <>
                                    <img src={likeIcon} alt="Like" css={styles.actionIcon} />
                                    <span>Đã thích</span>
                                </>
                            )}
                            {selectedPost.userReactType === 2 && (
                                <>
                                    <img src={laughGif} alt="Laugh" css={styles.actionIcon} />
                                    <span>Đã cười</span>
                                </>
                            )}
                            {selectedPost.userReactType === 3 && (
                                <>
                                    <img src={heart} alt="Love" css={styles.actionIcon} />
                                    <span>Đã yêu thích</span>
                                </>
                            )}
                            {selectedPost.userReactType === 4 && (
                                <>
                                    <img src={sadGif} alt="Sad" css={styles.actionIcon} />
                                    <span>Đã buồn</span>
                                </>
                            )}

                            {/* Nếu chưa react */}
                            {selectedPost.userReactType === null && (
                                <>
                                    <img src={likeIcon} alt="Like" css={styles.actionIcon} />
                                    <span>Yêu thích</span>
                                </>
                            )}

                            <div css={styles.heartAnimation}>
                                <div css={styles.reactIcons}>
                                    <img src={heart} alt="Heart" css={styles.reactIcon} />
                                    <img src={likeGif} alt="Like" css={styles.reactIcon} />
                                    <img src={sadGif} alt="Sad" css={styles.reactIcon} />
                                    <img src={laughGif} alt="Laugh" css={styles.reactIcon} />
                                </div>
                            </div>
                        </div>
                        <div css={styles.actionGroup}>
                            <img src={commentIcon} alt="Comment" css={styles.actionIcon} />
                            <span>Bình luận</span>
                        </div>
                        <div css={styles.actionGroup}>
                            <img src={shareIcon} alt="Share" css={styles.actionIcon} />
                            <span>Chia sẻ</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div css={styles.postList}>
                    {/* Danh sách các bài đăng */}
                    {postsToDisplay.map((post) => (
                        <div key={post.id} css={styles.postCard}>
                            <div css={styles.postHeader}>
                                {/* Hiển thị ảnh đại diện của người dùng */}
                                <img src={post.user.avatar || defaultAvatar} alt="Avatar" css={styles.postAvatar} />
                                <div css={styles.userInfo}>
                                    {/* Hiển thị tên người dùng */}
                                    <p css={styles.postUserName}>{post.user.first_name} {post.user.last_name}</p>
                                    {/* Hiển thị thời gian đăng bài */}
                                    <p css={styles.postTime}>{formatTimeAgo(post.created_date)}</p>
                                </div>
                            </div>
                            <p>{post.content}</p>
                            {post.images && post.images.map((image) => (
                                <img key={image.id} src={image.image} alt="Post Image" css={styles.postImage} />
                            ))}
                            {post.videos && post.videos.map((video) => (
                                <video key={video.id} controls css={styles.postVideo}>
                                    <source src={video.video} type="video/mp4" />
                                </video>
                            ))}

                            <div css={styles.iconsAndCmtCount}>
                                {/* Hiển thị phản ứng nếu có */}
                                {reactions[post.id] && reactions[post.id].length > 0 && (
                                    <div css={styles.reactionsContainer}>
                                        {/* Hiển thị các icon phản ứng */}
                                        {reactions[post.id].map((reaction) => (
                                            console.log('Reaction:', reaction), // Log reaction data

                                            <div key={reaction.id} css={styles.reaction}>
                                                <img src={getReactionIcon(reaction.type)} css={styles.reactionIcon} />
                                            </div>
                                        ))}

                                        {/* Đếm và hiển thị tổng số lượng phản ứng */}
                                        <div css={styles.reactionCount}>
                                            {reactions[post.id].length}
                                        </div>
                                    </div>
                                )}
                                <span>Có... bình luận</span>
                            </div>



                            <div css={styles.postActions}>
                                <div css={styles.actionGroup} onClick={() => handleReactPost(post.id, 3)}>
                                    <img src={getReactionIcon(post.userReaction)} alt="Reaction" css={styles.actionIcon} />
                                    <span>{getReactionText(post.userReaction)}</span>
                                    <div css={styles.heartAnimation}>
                                        <div css={styles.reactIcons}>
                                            <img
                                                src={heart}
                                                alt="Heart"
                                                css={styles.reactIcon}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReactPost(post.id, 3);
                                                }}
                                            />
                                            <img
                                                src={likeGif}
                                                alt="Like"
                                                css={styles.reactIcon}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReactPost(post.id, 1);
                                                }}
                                            />
                                            <img
                                                src={sadGif}
                                                alt="Sad"
                                                css={styles.reactIcon}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReactPost(post.id, 4);
                                                }}
                                            />
                                            <img
                                                src={laughGif}
                                                alt="Laugh"
                                                css={styles.reactIcon}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReactPost(post.id, 2);
                                                }}
                                            />
                                        </div>
                                    </div>


                                </div>

                                <div css={styles.actionGroup} onClick={() => handleCommentClick(post.id)}>
                                    <img src={commentIcon} alt="Comment" css={styles.actionIcon} />
                                    <span>Bình luận</span>
                                </div>
                                <div css={styles.actionGroup}>
                                    <img src={shareIcon} alt="Share" css={styles.actionIcon} />
                                    <span>Chia sẻ</span>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            )}
        </div>



    );
};

const styles = {
    container: css`
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
    `,
    newSearchBar: css`
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
    `,
    newSearchInput: css`
        width: 100%;
        max-width: 500px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 20px;
        outline: none;
    `,
    searchResults: css`
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 5px;
        margin-bottom: 20px;
    `,
    heartAnimation: css`
        position: absolute;
        top: -50px;
        left: 50%;
        transform: translateX(-50%) scale(0);
        background-color: white;
        padding: 10px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10%; /* Make the background circular */

    `,
    reactionsContainer: css`
        display: flex;
        align-items: center;
        margin-top: 8px;
    `,
    reaction: css`
        margin-right: 5px;
        display: inline-flex;
        align-items: center;
    `,
    reactionIcon: css`
        width: 16px;
        height: 16px;
        object-fit: cover;
    `,
    reactionCount: css`
        font-size: 14px;
        font-weight: bold;
        margin-right: 10px;
    `,
    actionGroup: css`
        position: relative;
        display: flex;
        align-items: center;
        cursor: pointer;
        transition: background-color 0.3s ease;
        padding: 5px 10px;
        border-radius: 10px;
        &:hover {
            background-color: #f0f0f0;
        }
        &:hover > div {
            transform: scale(1);
            opacity: 1;
            animation: bounce 0.5s ease-in-out;
        }
    `,
    modalImage: css`
        max-width: 100%;
        max-height: 150px;
        border-radius: 8px;
        margin-top: 10px;
        object-fit: contain;
    `,
    resultItem: css`
        padding: 10px;
        cursor: pointer;
        &:hover {
            background: #f0f0f0;
        }
    `,
    modalFooter: css`
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 16px;
    `,
    sharePost: css`
        background: #fff;
        border-radius: 10px;
        padding: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        margin-bottom: 20px;
        cursor: pointer;
    `,
    searchBar: css`
        display: flex;
        align-items: center;
    `,
    avatar: css`
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 10px;
    `,
    searchInput: css`
        flex-grow: 1;
        border: none;
        outline: none;
        padding: 10px;
        border-radius: 20px;
        background: #f0f0f0;
    `,
    iconContainer: css`
        display: flex;
        align-items: center;
        margin-left: 10px;
    `,
    modalIcons: css`
        display: flex;
        gap: 10px;
    `,
    iconsAndCmtCount: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    `,

    icon: css`
        width: 24px;
        height: 24px;
        cursor: pointer;
        &:hover {
            filter: brightness(0.8);
        }
    `,
    modalBody: css`
        display: flex;
        flex-direction: column;
        gap: 10px;
    `,
    commentCount: `
            margin-left: auto`,
    modalOverlay: css`
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `,
    modalContent: css`
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        max-width: 480px;
        width: 100%;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    `,
    modalAvatar: css`
        width: 40px;
        height: 40px;
        border-radius: 50%;
    `,
    userPrivacy: css`
        color: gray;
        font-size: 14px;
    `,
    modalHeader: css`
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    `,
    textArea: css`
        width: 100%;
        height: 80px;
        padding: 10px;
        border-radius: 6px;
        border: 1px solid #ddd;
        outline: none;
        resize: none;
    `,
    imagePreviewContainer: css`
        text-align: center;
        margin-bottom: 10px;
    `,
    imagePreview: css`
        max-width: 100%;
        border-radius: 10px;
    `,
    submitButton: css`
        padding: 8px 16px;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        &:disabled {
            background-color: #ccc;
        }
        &:hover:not(:disabled) {
            background-color: #45a049;
        }
    `,
    notification: css`
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #4caf50;
        color: #fff;
        padding: 10px 20px;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        z-index: 2000;
    `,
    closeButton: css`
        font-size: 24px;
        cursor: pointer;
        border: none;
        background: transparent;
        color: #333;
        &:hover {
            color: #999;
        }
    `,
    postCard: css`
        border: 1px solid #ccc;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 20px;
        position: relative;
    `,
    postHeader: css`
        display: flex;
        align-items: center;
    `,
    postAvatar: css`
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 10px;
    `,
    userInfo: css`
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
    `,
    postUserName: css`
        font-weight: bold;
    `,
    postTime: css`
        color: gray;
        font-size: 14px;
    `,
    reactIcons: css`
        display: flex;
        align-items: center;
        justify-content: center;  /* Canh giữa các icon */
        gap: 10px;  /* Khoảng cách giữa các icon */

    `,
    reactIcon: css`
        width: 44px;
        height: 44px;
        padding: 10px; /* Add padding to create a background effect */
        border-radius: 50%; /* Make the background circular */
        background-color: transparent; /* Default background */
        transition: background-color 0.3s ease; /* Smooth transition */
        &:hover {
            background-color: rgba(0, 0, 0, 0.1); /* Darken background on hover */
        }
    `,
    postImage: css`
        width: 100%;
        max-height: 300px;
        object-fit: cover;
        margin-top: 10px;
        margin-bottom: 2px;
    `,
    postVideo: css`
        width: 100%;
        max-height: 300px;
        object-fit: cover;
        margin-top: 10px;
    `,
    postActions: css`
        display: flex;
        justify-content: space-around;
        align-items: center;
        margin-top: 10px;
        padding-top: 10px;
    `,
    actionIcon: css`
        width: 20px;
        height: 20px;
        margin-right: 5px;
    `,
    dividerLine: css`
        width: 100%;
        height: 1px;
        background-color: #ccc;
        margin: 2px 0;
    `,
    heartGif: css`
        width: 24px;
        height: 24px;
    `,
    '@keyframes bounce': css`
        0%, 100% {
            transform: scale(0.8);
        }
        50% {
            transform: scale(1.2);
        }
    `,
};

export default MainContent;
