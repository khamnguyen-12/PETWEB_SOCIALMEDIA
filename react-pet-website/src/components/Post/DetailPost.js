/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { useContext } from 'react';
import { MyUserContext } from '../../configs/MyContext';
import defaultAvatar from '../../images/avatarModel.jpg';
import likeIcon from '../../images/love.png';
import commentIcon from '../../images/comment.png';
import shareIcon from '../../images/send.png';

const DetailPost = ({ post }) => {
    const user = useContext(MyUserContext);

    if (!user) {
        return <p>Vui lòng đăng nhập để xem nội dung.</p>;
    }

    const formatTimeAgo = (time) => {
        const diff = Math.floor((new Date() - new Date(time)) / 1000);
        if (diff < 60) return `${diff} giây trước`;
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        return `${Math.floor(diff / 86400)} ngày trước`;
    };

    return (
        <div css={styles.postCard}>
            <div css={styles.postHeader}>
                <img src={user.avatar || defaultAvatar} alt="Avatar" css={styles.postAvatar} />
                <div css={styles.userInfo}>
                    <p css={styles.postUserName}>{user.first_name} {user.last_name}</p>
                    <p css={styles.postTime}>{formatTimeAgo(post.created_at)}</p>
                </div>
            </div>
            <p>{post.content}</p>
            {post.images && post.images.map((image) => (
                <div key={image.id}>
                    <img src={image.image} alt="Post Image" css={styles.postImage} />
                    <div css={styles.dividerLine}></div>
                </div>
            ))}
            {post.videos && post.videos.map((video) => (
                <video key={video.id} controls css={styles.postVideo}>
                    <source src={video.video} type="video/mp4" />
                </video>
            ))}
            <div css={styles.postActions}>
                <img src={likeIcon} alt="Like" css={styles.actionIcon} /> Yêu thích
                <img src={commentIcon} alt="Comment" css={styles.actionIcon} /> Bình luận
                <img src={shareIcon} alt="Share" css={styles.actionIcon} /> Chia sẻ
            </div>
        </div>
    );
};

const styles = {
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
        flex-direction: column;
    `,
    postUserName: css`
        font-weight: bold;
    `,
    postTime: css`
        color: gray;
        font-size: 14px;
    `,
    postImage: css`
        width: 100%;
        max-height: 300px;
        object-fit: contain;
        margin-top: 10px;
        margin-bottom: 2px;
    `,
    postVideo: css`
        width: 100%;
        max-height: 300px;
        object-fit: contain;
        margin-top: 10px;
    `,
    postActions: css`
        display: flex;
        justify-content: space-around;
        margin-top: 10px;
        padding-top: 5px;
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
};

export default DetailPost;
