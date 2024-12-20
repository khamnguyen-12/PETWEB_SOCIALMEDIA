import React, { useEffect, useState } from 'react';
import { authAPI, endpoints } from '../../configs/APIs';
import arrowPng from '../../images/next.png';
import PP1 from '../../images/PP1.jpg';
import PP2 from '../../images/PP2.jpg';
import PP3 from '../../images/PP3.jpg';
import PP4 from '../../images/PP4.png';
import PP5 from '../../images/PP5.jpg';
import PP7 from '../../images/PP7.jpg';
import PP8 from '../../images/PP8.jpg';
import PP9 from '../../images/PP9.jpg';
import PP10 from '../../images/PP10.jpg';
import PP11 from '../../images/PP11.jpg';




const Petpost = () => {
    const [categories, setCategories] = useState([]);
    const [topic, setTopics] = useState([]);
    const [petposts, setPetpost] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);

    // State để quản lý bài viết được chọn
    const [selectedPost, setSelectedPost] = useState(null);
    const [selectedTopicId, setSelectedTopicId] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(''); // Lưu tên topic đã chọn
    const imageArray = [PP1, PP2, PP3, PP4, , PP7, PP8, PP9, PP10, PP11];

    const getRandomImage = () => {
        return imageArray[Math.floor(Math.random() * imageArray.length)];
    };


    // Hàm xử lý nhấp vào tiêu đề bài viết
    const handlePostClick = (post) => {
        setSelectedPost(post);
        setModalOpen(true);

    };
    const closeModal = () => {
        setModalOpen(false);
        setSelectedPost(null);
    };
    // Gọi cả hai hàm fetch song song
    useEffect(() => {
        const fetchData = async () => {
            try {
                const someTopicId = topic?.id; // Lấy topicId nếu topic đã có id
                await Promise.all([fetchCategories(), fetchTopic(), fetchPetpost(), someTopicId && fetchPetpostByTopic(someTopicId)]); // Gọi cả hai hàm đồng thời
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData(); // Gọi hàm fetch khi component mount
    }, []);

    const fetchPetpostByTopic = async (topicId) => {
        try {

            if (!topicId) {
                console.error('topicId is undefined. Cannot fetch petposts by topic.');
                return;
            }

            const res = await authAPI().get(endpoints['topic/petpost'](topicId));
            console.log('List petposts by topic:', res.data);
            setPetpost(res.data);
        } catch (error) {
            console.error('Error fetching petposts by topic:', error);
        }
    };


    const fetchCategories = async () => {
        try {
            const res = await authAPI().get(endpoints['category']);

            console.log('List categories:', res.data);
            console.log(res.status);

            const data = res.data;
            setCategories(data);

        } catch (error) {

        }
    }

    const fetchTopic = async () => {
        try {
            const res = await authAPI().get(endpoints['topic']);


            console.log('List topic:', res.data);
            console.log(res.status);

            const data = res.data;
            setTopics(data);

        } catch (error) {

        }
    }

    const fetchPetpost = async () => {
        try {
            const res = await authAPI().get(endpoints['petpost']);

            console.log('List petposts:', res.data);
            console.log(res.status);

            const data = res.data;
            setPetpost(data);

        } catch (error) {

        }
    }

    const handleTopicClick = async (topicId, topicName) => {
        setSelectedTopicId(topicId);
        setSelectedTopic(topicName); // Cập nhật tên topic đã chọn

        await fetchPetpostByTopic(topicId);
    };

    const getTopicsForCategory = (categoryID) => {
        return topic.filter(topic => topic.category.id === categoryID);
    }

    const styles = {

        textPetpostContainer: {
            maxHeight: '300px', // Giới hạn chiều cao
            overflowY: 'auto',  // Thêm thanh cuộn dọc khi cần
            padding: '10px',
        },

        petpostTitle: {
            fontSize: '24px',
            marginBottom: '15px',
        },
        petpostList: {
            // listStyleType: 'none',
            // padding: 0,
        },


        fullPost: {
            marginTop: '20px',
            padding: '15px',
            border: '1px solid #000',
        },

        contentContainer: {
            display: 'flex',
            justifyContent: 'space-between', // Ensures that the main content and sidebar are spaced out
            width: '90%',                   // Controls the width of the container (adjust as needed)
            backgroundColor: '#fff',         // Optional: Adds background for the content area
            padding: '20px',                 // Adds some padding for better aesthetics
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', // Optional: Adds a subtle shadow effect
            borderRadius: '10px',            // Optional: Rounds the corners
            overflow: 'auto', // Cho phép cuộn bên trong nếu cần

        },

        categoryContainer: {
            width: '300px',                  // Sets a fixed width for the category section
            // backgroundColor: '#f9f9f9',      // Optional: Adds a different background for the category section
            padding: '15px',                 // Adds some padding for the category container
            borderRadius: '8px',             // Optional: Rounds the corners
            boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)', // Adds a subtle shadow effect
        },
        petpostTitle: {
            textAlign: 'center',             // Centers the pet post title
            marginBottom: '20px',
        },

        textPetpost: {
            padding: '21px',
        },

        petpostItem: {
            marginBottom: '30px',              // Tăng khoảng cách giữa các bài đăng
            // padding: '20px',                   // Tăng khoảng cách bên trong mỗi bài đăng
            border: '2px solid #d0d0d0',       // Tăng độ dày của viền
            borderRadius: '10px',              // Bo góc lớn hơn
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Thêm đổ bóng để nổi bật
            transition: 'transform 0.2s ease', // Hiệu ứng khi hover
            overflow: 'hidden',              // Đảm bảo ảnh không tràn ra ngoài thẻ cha
            width: '100%',                     // Cho phần tử rộng hơn 100% vùng chứa
            cursor: 'pointer',
        },
        petpostImage: {
            width: '100%',                    // Đảm bảo hình ảnh chiếm toàn bộ chiều rộng của bài đăng
            maxHeight: '600px',               // Đặt chiều cao tối đa cho ảnh
            objectFit: 'cover',               // Cắt ảnh vừa khung mà không méo
            borderRadius: '8px',              // Bo góc cho ảnh
            transform: 'scale(1.1)',          // Phóng to ảnh thêm một chút
            transition: 'transform 0.3s ease',// Hiệu ứng khi hover
            marginBottom: `22px`
        },

        pageContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            justifyContent: 'center',
            overflow: 'auto', // Tạo cuộn khi nội dung lớn hơn vùng chứa
            paddingLeft: '200px',
        },
        pageTitle: {
            fontSize: '2rem',
            marginBottom: '20px',
        },

        mainContent: {
            flex: 1,
            padding: '20px',
            backgroundColor: '#f9f9f9',
            paddingLeft: '10px',
            marginRight: '110px', // Thêm khoảng cách bên phải

        },

        headerPetpost: {
            color: 'green',
            margin: '11px',
            fontWeight: 'bold',
        },
        categoryTitle: {
            fontSize: '1.5rem',
            marginBottom: '10px',
        },
        categoryList: {
            listStyleType: 'none',
            paddingLeft: '0',
        },
        categoryItem: {
            padding: '10px 0',
            borderBottom: '1px solid #ccc',
        },
        topicList: {
            listStyleType: 'none',
            paddingLeft: '20px',
            marginTop: '10px',
        },
        topicItem: {
            padding: '5px 0',
            cursor: 'pointer',
            display: 'flex',            // Sử dụng Flexbox
            justifyContent: 'space-between', // Đưa nội dung về hai đầu
            alignItems: 'center'
        },
        fullPostModal: {
            display: modalOpen ? 'block' : 'none',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            height: '80%',
            backgroundColor: '#fff',
            padding: '20px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            display: 'flex',
            border: '5px solid #48D1CC'
        },
        overlay: {
            display: modalOpen ? 'block' : 'none',
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
        },
        closeButton: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            fontSize: '1.5em',
            cursor: 'pointer',
        },
        footerPetPost: {
            cursor: 'pointer',
            paddingLeft: '11px',
        },
        createdDate: {
            textAlign: 'right',
            paddingRight: '11px',
            fontStyle: 'italic',
            color: '#87CEFA',
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.contentContainer}>
                {/* Nội dung chính bên trái */}
                <div style={styles.mainContent}>
                    {/* Hiển thị danh sách petpost */}

                    <h2 style={styles.petpostTitle}>
                        {selectedTopic ? ` ${selectedTopic}` : 'Bài viết mới'}
                    </h2>
                    <ul style={styles.petpostList}>
                        {petposts.length > 0 ? (
                            petposts.map((post) => (
                                <li key={post.id} style={styles.petpostItem} onClick={() => handlePostClick(post)}>


                                    {post.image && (
                                        <img
                                            src={`http://127.0.0.1:8000/media/${post.image}`} // Local image path
                                            alt={post.title}
                                            style={{ ...styles.petpostImage }} // Thay đổi kích thước
                                            onError={(e) => {
                                                e.target.onerror = null; // Ngăn chặn vòng lặp
                                                e.target.src = getRandomImage(); // Hình ảnh dự phòng
                                            }}
                                        />
                                    )}
                                    <div style={styles.headerPetpost}>
                                        {post.topic.name}
                                    </div>

                                    <div style={styles.footerPetPost} >
                                        <h3 >
                                            {post.title}
                                        </h3>
                                        {/* Hiển thị nội dung đã được giới hạn 40 từ */}
                                        <p>
                                            {post.content.split(' ').slice(0, 20).join(' ')}...
                                        </p>
                                        <p style={styles.createdDate}>
                                            Ngày tạo: {new Date(post.created_date).toLocaleDateString('vi-VN')}
                                        </p>

                                    </div>
                                </li>
                            ))
                        ) : (
                            <li>Không có bài viết nào.</li>
                        )}
                    </ul>

                </div>

                {/* Vùng container bên phải để hiển thị danh sách Category */}
                <div style={styles.categoryContainer}>
                    {/* <h2 style={styles.categoryTitle}>Danh mục</h2> */}
                    <ul style={styles.categoryList}>
                        {categories.length > 0 ? (
                            categories.map((category) => (
                                <li key={category.id} style={styles.categoryItem}>
                                    <strong style={{

                                    }}>{category.name}</strong>
                                    {/* Hiển thị danh sách topics thuộc category này */}
                                    <ul style={styles.topicList}>
                                        {getTopicsForCategory(category.id).length > 0 ? (
                                            getTopicsForCategory(category.id).map((topic) => (
                                                <li
                                                    key={topic.id}
                                                    style={{
                                                        ...styles.topicItem,
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        transition: 'background-color 0.3s, color 0.3s', borderRadius: '22px', // Hiệu ứng chuyển màu
                                                    }}
                                                    onClick={() => handleTopicClick(topic.id, topic.name)} // Thêm sự kiện onClick
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#0099FF'; // Màu nền khi hover
                                                        e.currentTarget.style.color = 'white'; // Màu chữ khi hover
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = ''; // Đặt lại màu nền khi không hover
                                                        e.currentTarget.style.color = ''; // Đặt lại màu chữ khi không hover
                                                    }}
                                                >
                                                    <span style={{ flex: 1, padding: '5px' }}>{topic.name}</span>
                                                    <img
                                                        src={arrowPng}
                                                        alt="Arrow"
                                                        style={{
                                                            width: '1.5em',
                                                            height: '1.5em',
                                                            marginRight: '10px',
                                                        }}
                                                    />
                                                </li>

                                            ))
                                        ) : (
                                            <li>Không có topics nào.</li>
                                        )}
                                    </ul>
                                </li>
                            ))
                        ) : (
                            <li>Không có danh mục nào.</li>
                        )}
                    </ul>
                </div>
            </div>
            {/* Modal cho nội dung đầy đủ của bài viết */}
            {modalOpen && (
                <>
                    <div style={styles.overlay} onClick={closeModal}></div>
                    <div style={{ ...styles.fullPostModal, borderRadius: '15px', overflow: 'hidden' }}>
                        {selectedPost && (
                            <>
                                <div style={styles.textPetpostContainer}>
                                    <h3>{selectedPost.title}</h3>
                                    <p>{selectedPost.content}</p>
                                    <div style={{ margin: '20px', paddingTop: '44px', textAlign: 'right' }}>
                                        <p style={{ fontStyle: 'italic', color: 'gray' }}>
                                            Ngày tạo: {new Date(selectedPost.created_date).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>

                                <img
                                    src={`http://127.0.0.1:8000/media/${selectedPost.image}`}
                                    alt={selectedPost.title}
                                    style={{
                                        width: '50%',
                                        height: 'auto',
                                        maxHeight: '70vh',
                                        objectFit: 'contain',
                                        marginTop: '-20px',
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = getRandomImage();
                                    }}
                                />
                            </>
                        )}
                    </div>
                </>
            )}

        </div>
    );
};

// Các styles cơ bản cho layout


export default Petpost;
