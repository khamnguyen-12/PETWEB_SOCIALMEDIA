import React, { useState, useEffect, useContext } from 'react';
import { Modal, Form, Card, Button, Alert, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

import cookie from 'react-cookies';

import { MyDispatchContext } from '../../configs/MyContext';
import { authAPI, endpoints } from '../../configs/APIs';

import bacMor from '../../images/bee.png';


const Moderator = () => {
    const navigate = useNavigate();
    const dispatch = useContext(MyDispatchContext);
    const [categories, setCategories] = useState([]); // State để lưu category
    const [showCategories, setShowCategories] = useState(false); // State để điều khiển việc hiển thị danh mục
    const [showTopic, setShowTopic] = useState(false);
    const [topics, setTopic] = useState([]);
    const [activeSection, setActiveSection] = useState(null); // Quản lý trạng thái của section đang hiển thị
    const [user, setUser] = useState([]);
    const [error, setError] = useState('');
    const [newCategory, setNewCategory] = useState(''); // State to handle new category input
    const [showModal, setShowModal] = useState(false); // State to control modal visibility
    const [alertMessage, setAlertMessage] = useState(''); // State for displaying success/failure message
    const [alertVariant, setAlertVariant] = useState(''); // State to control alert type (success or danger)
    const [showAlert, setShowAlert] = useState(false); // State to control the visibility of the alert
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(''); // Trạng thái để lưu category được chọn
    const [showPopup, setShowPopup] = useState(false);

    const [showTopicModal, setShowTopicModal] = useState(false);
    const [newTopic, setNewTopic] = useState('');
    const [petPosts, setPetPosts] = useState([]);  // Add state to store pet posts
    const [showWelcome, setShowWelcome] = useState(true);
    const [reports, setReports] = useState([]);


    const [showModalPetpost, setShowModalPetPost] = useState(false); // State to control modal visibility
    const [isDropdownOpen, setDropdownOpen] = useState(null);
    // const [reports, setReports] = useState('initialReports'); // Giả sử `initialReports` là dữ liệu ban đầu
    const [popupMessage, setPopupMessage] = useState(null); // State để lưu thông báo


    const [formData, setFormData] = useState({
        title: '',
        content: '',
        author: '71',
        image: null,
        topic: ''
    });
    const handleShow = () => setShowModalPetPost(true);
    const handleClose = () => setShowModalPetPost(false);

    const toggleStatusDropdown = (id) => {
        if (isDropdownOpen === id) {
            setDropdownOpen(null); // Đóng dropdown nếu đã mở
        } else {
            setDropdownOpen(id); // Mở dropdown của báo cáo được nhấn
        }
    };

    const handlePostClick = (postId) => {
        navigate(`/post-link/${postId}`); // Chuyển đến PostLink với postId
    };

    // Hàm để cập nhật trạng thái của báo cáo
    const handleStatusChange = async (id, newStatus) => {
        try {
            // Xác định giá trị trạng thái tương ứng với API
            const statusValue = newStatus === 'processed' ? 2 : 3;

            // Gọi API để cập nhật trạng thái báo cáo
            const response = await authAPI().patch(endpoints.mor_checkreport(id), {
                status_report: statusValue
            });

            // API trả về thành công, cập nhật giao diện
            const updatedReports = reports.map(report =>
                report.id === id
                    ? { ...report, status_display: response.data.status_display } // Cập nhật theo phản hồi API
                    : report
            );

            setReports(updatedReports); // Cập nhật lại state với trạng thái mới
            setDropdownOpen(null); // Đóng dropdown sau khi chọn
            // Hiển thị thông báo popup
            setPopupMessage(`Trạng thái đã được cập nhật thành: ${response.data.status_display}`);

        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            // Xử lý lỗi nếu cần
        }
    };

    const PopupMessage = ({ message, duration = 2000, onClose }) => {
        useEffect(() => {
            if (message) {
                const timer = setTimeout(() => {
                    onClose(); // Tự động đóng sau thời gian đã định
                }, duration);

                // Dọn dẹp timer khi component unmount hoặc message thay đổi
                return () => clearTimeout(timer);
            }
        }, [message, duration, onClose]);

        if (!message) return null; // Không hiển thị nếu không có thông báo

        return (
            <div style={styles.popup}>
                <p>{message}</p>
            </div>
        );
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        setFormData({
            ...formData,
            image: e.target.files[0]
        });
    };

    // Hàm gọi API để submit bài viết mới
    const handleSubmit = async () => {
        // Kiểm tra nếu có trường nào chưa được điền
        if (!formData.author || !formData.content || !formData.image || !formData.title || !formData.topic) {
            triggerAlert('Hãy điền đầy đủ thông tin!', 'error');
            return; // Dừng lại nếu có trường chưa điền
        }

        try {
            // Tạo formData object để gửi dữ liệu dưới dạng multipart/form-data
            const formSubmitData = new FormData();
            formSubmitData.append('title', formData.title);
            formSubmitData.append('content', formData.content);
            formSubmitData.append('author', formData.author);
            formSubmitData.append('topic_id', formData.topic);

            if (formData.image) {
                formSubmitData.append('image', formData.image); // Đính kèm file ảnh
            }

            // In ra các dữ liệu trong FormData
            for (let pair of formSubmitData.entries()) {
                console.log(pair[0] + ': ' + pair[1]); // Hiển thị từng cặp key-value của FormData
            }

            let res;

            // Gửi dữ liệu tới API petpost
            if (formData.id) {
                // Nếu có id, thực hiện PATCH để cập nhật bài viết
                res = await authAPI().patch(`${endpoints['petpost']}${formData.id}/`, formSubmitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data' // Đảm bảo rằng content-type là multipart/form-data
                    }
                });
            } else {
                // Nếu không có id, thực hiện POST để tạo bài viết mới
                res = await authAPI().post(endpoints['petpost'], formSubmitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data' // Đảm bảo rằng content-type là multipart/form-data
                    }
                });
            }

            console.log(res.status);
            console.log('Bài viết đã được xử lý:', res.data);
            handleClose(); // Đóng modal sau khi gửi thành công

            fetchDataWithLoading(fetchPetpost);
            triggerAlert(formData.id ? "Bài viết được cập nhật thành công!" : "Bài viết được tạo thành công!", 'success');
        } catch (error) {
            // Log chi tiết lỗi để dễ dàng debug
            console.error('Error processing pet post:', error);
            if (error.response) {
                console.log('Response data:', error.response.data); // Log dữ liệu từ response để xem lỗi cụ thể từ server
                console.log('Response status:', error.response.status);
                console.log('Response headers:', error.response.headers);
            }
            triggerAlert('Đã có lỗi xảy ra khi xử lý bài viết!', 'error');
        }
    };


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await authAPI().get(endpoints['current_user']); // Replace 'current_user' with your actual API endpoint
                const data = response.data;
                setUser(data); // Store the user data in the state
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUser();
    }, []);

    // Trigger alert function
    const triggerAlert = (message, type) => {
        setAlertMessage(message); // Set the alert message
        setAlertVariant(type); // Set the alert variant ('success' or 'error')
        setShowAlert(true); // Show the alert

        // Hide alert after 2 seconds
        setTimeout(() => {
            setShowAlert(false); // Hide alert after 2 seconds
        }, 2000);
    };

    const fetchDataWithLoading = async (fetchFunction) => {
        setIsLoading(true);
        await fetchFunction(); // Thực thi hàm được truyền vào
        setIsLoading(false);
    };

    const handleLogout = () => {
        cookie.remove('user');
        dispatch({ type: 'logout' });
        navigate('/login');
    };

    // Function to add a new category
    // Function to add a new category
    const addCategory = async (e) => {
        e.preventDefault();
        if (newCategory.trim() === '') {
            setError('Bạn cần nhập tên danh mục.');
            return;
        }

        try {
            const response = await authAPI().post('http://127.0.0.1:8000/categories/', { name: newCategory });
            setCategories([...categories, response.data]); // Add new category to the list
            setNewCategory(''); // Clear input after successful submission
            setError('');
            setShowModal(false); // Close modal after adding
            setAlertMessage('Category added successfully!'); // Set success message
            setAlertVariant('success'); // Set alert to success type
            setShowAlert(true); // Show alert

            setTimeout(() => {
                setShowAlert(false); // Hide alert after 3 seconds
            }, 3000); // 3000 milliseconds = 3 seconds
        } catch (error) {
            console.error('Error adding category:', error);
            setAlertMessage('Failed to add category. Please try again.'); // Set error message
            setAlertVariant('danger'); // Set alert to danger type
            setShowAlert(true); // Show alert

        }
    };


    // Hàm gọi API để lấy danh sách categories
    const fetchCategories = async () => {
        try {
            const response = await authAPI().get(endpoints['category']);
            const data = response.data;
            setCategories(data); // Lưu dữ liệu vào state
            setShowCategories(true); // Hiển thị danh mục sau khi lấy dữ liệu
            setActiveSection('categories'); // Hiển thị phần categories
            console.log(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchTopics = async () => {
        try {
            const res = await authAPI().get(endpoints['topic']);
            const data = res.data;
            setTopic(data);
            setShowTopic(true);
            setActiveSection('topics'); // Hiển thị phần topics
            console.log(data);
        } catch (error) {
            console.error('Error fetch Topic:', error);
        }
    }


    const fetchTopicsCombobox = async () => {
        try {
            const res = await authAPI().get(endpoints['topic']);
            const data = res.data;
            setTopic(data);
            setShowTopic(true);
            console.log(data);
        } catch (error) {
            console.error('Error fetch Topic:', error);
        }
    }

    // Function to fetch pet posts
    const fetchPetpost = async () => {
        try {
            setIsLoading(true);
            const response = await authAPI().get(endpoints['petpost']);

            console.log("APi success: ", response)
            const data = response.data;


            setActiveSection('petpost');
            console.log("Data response: ", data)
            setPetPosts(data); // Store the fetched pet posts in state
        } catch (error) {
            setError('Error fetching pet posts');
            console.error("Error occurred during API call:", error);

        } finally {
            setIsLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Đã giải quyết':
                return {
                    padding: '5px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#d4edda', // Màu nền xanh nhạt
                    color: '#155724', // Màu chữ xanh đậm
                    border: '1px solid #c3e6cb'
                };
            case 'Bị từ chối':
                return {
                    padding: '5px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#f8d7da', // Màu nền đỏ nhạt
                    color: '#721c24', // Màu chữ đỏ đậm
                    border: '1px solid #f5c6cb'
                };
            case 'Chờ xử lý':
            default:
                return {
                    padding: '5px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#fff3cd', // Màu nền vàng nhạt
                    color: '#856404', // Màu chữ vàng đậm
                    border: '1px solid #ffeeba'
                };
        }
    };


    const loadCategories = async () => {
        try {
            const response = await authAPI().get(endpoints['category']);
            const data = response.data;
            setCategories(data); // Lưu dữ liệu vào state
            setShowCategories(true); // Hiển thị danh mục sau khi lấy dữ liệu
            setActiveSection('categories'); // Hiển thị phần categories
            console.log(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        setShowPopup(true);
        loadCategories();

        // Tự động ẩn popup sau 3 giây
        const timer = setTimeout(() => {
            setShowPopup(false);
        }, 3000);

        // Cleanup timer
        return () => clearTimeout(timer);
    }, []);

    const editCategory = async (id) => {
        // Hiển thị hộp thoại cho người dùng nhập tên mới
        const newName = prompt("Nhập tên mới cho Category:");

        if (newName) {
            try {
                // Gọi API để cập nhật tên category
                const response = await authAPI().patch(endpoints['update_category'](id), {
                    name: newName
                });

                if (response.status === 200) {
                    console.log('Category name updated successfully', response.data);
                    // Cập nhật lại UI hoặc danh sách categories sau khi sửa tên thành công
                    // Có thể gọi hàm load lại danh sách categories nếu cần
                    loadCategories();
                } else {
                    console.error('Failed to update category name. Status code:', response.status);
                    alert('Cập nhật tên không thành công. Vui lòng thử lại.');
                }
            } catch (error) {
                // Xử lý lỗi
                console.error('Error updating category name:', error);
                alert('Có lỗi xảy ra khi cập nhật tên Category. Vui lòng thử lại.');
            }
        } else {
            console.log("Người dùng đã hủy thay đổi.");
        }
    };

    const editTopic = async (id) => {
        // Hiển thị hộp thoại cho người dùng nhập tên mới
        const newName = prompt("Nhập tên mới cho Topic:");

        if (newName) {
            try {
                // Gọi API để cập nhật tên category
                const response = await authAPI().patch(endpoints['edit_topic'](id), {
                    name: newName
                });

                if (response.status === 200) {
                    console.log('Category name updated successfully', response.data);
                    // Cập nhật lại UI hoặc danh sách categories sau khi sửa tên thành công
                    // Có thể gọi hàm load lại danh sách categories nếu cần
                    fetchTopics();
                } else {
                    console.error('Failed to update category name. Status code:', response.status);
                    alert('Cập nhật tên không thành công. Vui lòng thử lại.');
                }
            } catch (error) {
                // Xử lý lỗi
                console.error('Error updating category name:', error);
                alert('Có lỗi xảy ra khi cập nhật tên Category. Vui lòng thử lại.');
            }
        } else {
            console.log("Người dùng đã hủy thay đổi.");
        }
    }

    const deleteTopic = async (id) => {
        try {
            // Make the DELETE request to deactivate the topic
            const response = await authAPI().patch(endpoints['deactivate_topic'](id), {
                active: false
            });

            if (response.status === 200) {
                fetchTopics();
                triggerAlert('Topic deactivated successfully!');
            }
        } catch (error) {
            console.error('Error deactivating topic:', error);
            triggerAlert('Failed to deactivate topic.');
        }
    }

    const deletePetPost = async (id) => {
        try {
            console.log("API URL: ", endpoints['delete_petpost'](id)); // In ra URL để kiểm tra
            const res = await authAPI().patch(endpoints['delete_petpost'](id));

            // Kiểm tra phản hồi
            if (res.status === 200 || res.status === 204) {
                console.log('Petpost deactivated successfully', res.data);

                // Cập nhật lại danh sách petpost
                await fetchPetpost();

                // Thông báo thành công
                alert('PetPost deactivated successfully');
            } else {
                console.error('Failed to deactivate Petpost. Status code:', res.status);
                alert(`Failed to deactivate category. Status code: ${res.status}`);
            }
        } catch (error) {
            console.error("Error occurred when fetching petpost", error);
            alert('Error deactivating petpost: ' + error.message);
        }
    };


    const deleteCategory = async (id) => {
        try {
            // Gọi API để vô hiệu hóa category bằng phương thức PATCH
            const response = await authAPI().patch(endpoints['function_category'](id), {
                active: false
            });

            // Kiểm tra phản hồi
            if (response.status === 200 || response.status === 204) {
                console.log('Category deactivated successfully', response.data);

                // Cập nhật lại danh sách category (giả sử có hàm fetchCategories để cập nhật danh sách)
                await fetchCategories();

                // Thông báo thành công
                alert('Category deactivated successfully');
            } else {
                console.error('Failed to deactivate category. Status code:', response.status);
                alert(`Failed to deactivate category. Status code: ${response.status}`);
            }
        } catch (error) {
            // Xử lý lỗi
            console.error('Error deactivating category:', error);
            alert('Error deactivating category: ' + error.message);
        }
    };

    // Hiển thị modal khi nút "Thêm Topic" được nhấn
    const handleAddTopicClick = () => {

        setShowTopicModal(true);
        setNewTopic(''); // Đặt lại giá trị tên topic
        setSelectedCategory(''); // Đặt lại giá trị category đã chọn
        setError(''); // Xóa lỗi trước khi mở modal
        // setShowTopicModal(true);
        // fetchCategories(); // Lấy danh sách categories khi mở modal
    };

    const handleEditClick = (post) => {
        setFormData({
            id: post.id, // Thêm id vào formData để nhận biết khi nào sửa
            title: post.title,
            content: post.content,
            author: '71',
            topic: post.topic.id, // Giả sử topic có id
            image: null // Xử lý ảnh nếu cần
        });
        setShowModalPetPost(true); // Hiển thị modal
    };


    // Hàm thêm topic
    const addTopic = async (e) => {
        e.preventDefault();
        if (newTopic.trim() === '' || !selectedCategory) {
            setError('Bạn cần nhập tên topic và chọn category.');
            return;
        }

        try {
            // const response = await authAPI().post(endpoints['topic'], { name: newTopic, category: selectedCategory });

            const response = await authAPI().post(endpoints['topic'], { name: newTopic, category_id: selectedCategory });
            setTopic((prevTopics) => [...prevTopics, response.data]); // Cập nhật danh sách topic
            setNewTopic('');
            setSelectedCategory('');
            setShowTopicModal(false);
            setAlertMessage('Topic added successfully!');
            setAlertVariant('success');
            setShowAlert(true);
            setTimeout(() => {
                setShowAlert(false); // Hide alert after 3 seconds
            }, 3000); // 3000 milliseconds = 3 seconds
        } catch (error) {
            console.error('Error adding topic:', error);
            setAlertMessage('Failed to add topic. Please try again.');
            setAlertVariant('danger');
            setShowAlert(true);
        }
    };

    const fetchReports = async () => {
        try {
            const response = await authAPI().get(endpoints['report']);
            // Giả sử API trả về mảng các báo cáo
            const reportsData = response.data;
            setReports(reportsData);
            console.log('Reports:', reportsData); // Hiển thị báo cáo trong console
        } catch (error) {
            console.error('Lỗi khi lấy báo cáo:', error);
            alert('Có lỗi xảy ra khi lấy danh sách báo cáo.');
        }
    };


    return (
        <div style={css.container}>
            {/* <img src={bacMor} alt="Background" style={{ width: '100%', height: 'auto', position: 'absolute', top: 0, left: 0, zIndex: -1 }} /> */}
            {showPopup && (
                <div style={styles.popup}>
                    <strong>MỪNG TRỞ LẠI</strong><br />
                    HAVE A GOOD DAY MODERATOR<br />
                    <span style={{ fontWeight: 'bold', fontSize: '1.3em' }}>
                        "{user.first_name} {user.last_name}"
                    </span>
                </div>
            )}

            {/* Phần hiển thị nội dung chính bên trái */}
            <div style={{ flex: 8, ...css.mainContent }}>
                <Card className="text-center">


                    <Card.Header as="h1">
                        {activeSection === 'categories' && `Trang Quản Lý Category`}
                        {activeSection === 'topics' && `Trang Quản Lý Topic`}
                        {activeSection === 'petpost' && `Trang Quản Lý PetPost`}
                        {activeSection === 'reports' && `Trang Quản Lý Báo Cáo`} {/* Thêm phần này */}

                    </Card.Header>

                    <Card.Body>
                        {showAlert && (
                            <Alert
                                variant={alertVariant}
                                style={
                                    showAlert ? { ...css.alertPopup, ...(alertVariant === 'success' ? css.alertSuccess : css.alertError) }
                                        : { ...css.alertPopup, ...css.fadeOut }
                                }
                            >
                                <i className={alertVariant === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill'}></i>
                                {` ${alertMessage}`}
                            </Alert>
                        )}


                        {/* Hiển thị nội dung dựa trên trạng thái của activeSection */}
                        {activeSection === 'categories' && (
                            <div style={css.categoryList}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 className="mt-4">Danh mục</h3>
                                    <Button
                                        variant="success"
                                        style={css.addButton}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = css.addButtonHover.backgroundColor}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                                        onClick={() => setShowModal(true)}

                                    >
                                        Thêm Category
                                    </Button>
                                </div>
                                <ul className="list-group">
                                    {categories.map(category => (
                                        <li
                                            key={category.id}
                                            style={css.categoryItem}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = css.categoryItemHover.backgroundColor}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                                        >
                                            <div style={css.categoryName}>
                                                {category.name}
                                                <div style={css.buttonGroup}>
                                                    <button
                                                        style={css.editButton}
                                                        onClick={() => editCategory(category.id)}
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        style={css.deleteButton}
                                                        onClick={() => deleteCategory(category.id)}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                            </div>
                        )}

                        {activeSection === 'topics' && (
                            <>
                                <div style={css.headerRow}>
                                    <h3 className="mt-4">Chủ đề</h3>
                                    <Button
                                        variant="success"
                                        style={css.addButton}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = css.addButtonHover.backgroundColor}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                                        onClick={handleAddTopicClick}
                                    >
                                        Thêm chủ đề
                                    </Button>

                                    <Modal show={showTopicModal} onHide={() => setShowTopicModal(false)}>
                                        <Modal.Header closeButton>
                                            <Modal.Title>Nhập thông tin topic mới</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <Form onSubmit={addTopic}>
                                                <Form.Group>
                                                    <Form.Label>Tên Topic</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={newTopic}
                                                        onChange={(e) => setNewTopic(e.target.value)}
                                                    />
                                                </Form.Group>
                                                <Form.Group>
                                                    <Form.Label>Chọn Category</Form.Label>
                                                    <Form.Control as="select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                                                        <option value="">-- Chọn category --</option>
                                                        {categories.map((category) => (
                                                            <option key={category.id} value={category.id}>
                                                                {category.name}
                                                            </option>
                                                        ))}
                                                    </Form.Control>
                                                </Form.Group>
                                                {error && <small className="text-danger">{error}</small>}
                                                <Button variant="primary" type="submit" className="mt-3">
                                                    Thêm
                                                </Button>
                                            </Form>
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button variant="secondary" onClick={() => setShowTopicModal(false)}>Close</Button>
                                        </Modal.Footer>

                                    </Modal>
                                </div>
                                <ul className="list-group">
                                    {/* Hàng tiêu đề */}
                                    <li className="list-group-item" style={{ ...css.listItem, fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                                        <div style={{ ...css.column, width: '40%', borderRight: '1px solid #ddd' }}>Chủ đề</div>
                                        <div style={{ ...css.column, width: '30%', borderRight: '1px solid #ddd' }}>Danh mục</div>
                                        <div style={{ ...css.column, width: '30%' }}>Chỉnh</div>
                                    </li>

                                    {/* Dữ liệu của bảng */}
                                    {topics.map(topic => (
                                        <li key={topic.id} className="list-group-item" style={css.listItem}>
                                            <div style={{ ...css.column, width: '40%', borderRight: '1px solid #ddd' }}>{topic.name}</div>
                                            <div style={{ ...css.column, width: '30%', borderRight: '1px solid #ddd' }}>{topic.category?.name || 'No Category'}</div>
                                            <div style={{ ...css.column, width: '30%', textAlign: 'center' }}>
                                                <div style={css.buttonGroup}>
                                                    <button
                                                        style={css.editButtonTopic}
                                                        onClick={() => editTopic(topic.id)}
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        style={css.deleteButtonTopic}
                                                        onClick={() => deleteTopic(topic.id)}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>



                            </>
                        )}


                        {activeSection === 'petpost' && (
                            <>
                                <div style={css.petPostsSection}>

                                    <div style={css.headerFunction}>

                                        <h3
                                            className="mt-4" style={css.petPostsHeader}>Danh sách bài viết kiến thức </h3>

                                        <Button style={css.btnCreatePetpost} onClick={handleShow}> Tạo mới</Button>
                                    </div>



                                    <Modal show={showModalPetpost} onHide={handleClose}>
                                        <Modal.Header closeButton>
                                            <Modal.Title>{formData.id ? 'Sửa petpost' : 'Tạo bài viết mới'}</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <Form>
                                                <Form.Group controlId="formTitle">
                                                    <Form.Label>Title</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="title"
                                                        value={formData.title}
                                                        onChange={handleChange}
                                                        placeholder="Nhập tiêu đề"
                                                    />
                                                </Form.Group>

                                                <Form.Group controlId="formContent">
                                                    <Form.Label>Content</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        name="content"
                                                        value={formData.content}
                                                        onChange={handleChange}
                                                        rows={3}
                                                        placeholder="Nhập nội dung"
                                                    />
                                                </Form.Group>

                                                {/* <Form.Group controlId="formAuthor">
                                                    <Form.Label>Author</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="author"
                                                        value={formData.author}
                                                        onChange={handleChange}
                                                        placeholder="Nhập tên tác giả"
                                                    />
                                                </Form.Group> */}

                                                {/* Sử dụng combobox (select) để hiển thị topics */}
                                                <Form.Group controlId="formTopic">
                                                    <Form.Label>Topic</Form.Label>
                                                    <Form.Select
                                                        name="topic"
                                                        value={formData.topic}
                                                        onChange={handleChange}
                                                        onClick={fetchTopicsCombobox} // Gọi API khi click vào combobox
                                                    >
                                                        <option value="">Chọn chủ đề</option>
                                                        {topics.map((topic, index) => (
                                                            <option key={index} value={topic.id}>
                                                                {topic.name}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>


                                                <Form.Group controlId="formImage">
                                                    <Form.Label>Image</Form.Label>
                                                    <Form.Control
                                                        type="file"
                                                        name="image"
                                                        onChange={handleImageChange}
                                                    />
                                                </Form.Group>
                                            </Form>
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button variant="secondary" onClick={handleClose}>
                                                Đóng
                                            </Button>
                                            <Button variant="primary" onClick={handleSubmit}>
                                                {formData.id ? 'Cập nhật bài viết' : 'Lưu bài viết'}
                                            </Button>
                                        </Modal.Footer>
                                    </Modal>


                                    {/* Display fetched pet posts */}
                                    {petPosts.length > 0 ? (
                                        <ul className="list-group mt-4" style={css.petPostList}>

                                            {/* Hàng tiêu đề */}
                                            <li className="list-group-item" style={{ ...css.petPostItem, fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                                                <div style={{ ...css.column, width: '40%', borderRight: '1px solid #ddd' }}>Tiêu đề</div>
                                                <div style={{ ...css.column, width: '30%', borderRight: '1px solid #ddd' }}>Chủ đề</div>
                                                <div style={{ ...css.column, width: '30%' }}>Chỉnh</div>
                                            </li>

                                            {petPosts.map((post) => {
                                                // Kiểm tra nếu post.image là null hoặc không có giá trị, xử lý đường dẫn ảnh
                                                return (
                                                    <li key={post.id} className="list-group-item" style={css.petPostItem}>
                                                        <div style={{ ...css.column, width: '40%', borderRight: '1px solid #ddd' }}>
                                                            <small>{post.title}</small>
                                                        </div>
                                                        <div style={{ ...css.column, width: '30%', borderRight: '1px solid #ddd' }}>
                                                            {post.topic.name}
                                                        </div>
                                                        <div style={{ ...css.column, width: '30%', textAlign: 'center' }}>
                                                            <Button style={css.petPostButton} onClick={() => handleEditClick(post)}>Sửa</Button>
                                                            <Button style={css.petPostButtonDel} onClick={() => deletePetPost(post.id)}>Xóa</Button>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p>No pet posts available</p>
                                    )}




                                </div>
                            </>
                        )}
                        {activeSection === 'reports' && (
                            <div style={styles.reportContainer}>
                                {reports.length > 0 ? (
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>Bài viết số</th>
                                                <th style={styles.th}>Người báo cáo</th>
                                                <th style={styles.th}>Lý do</th>
                                                <th style={styles.th}>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reports.map(report => (
                                                <tr key={report.id} style={styles.tr}>
                                                    <td
                                                        style={{ ...styles.td, cursor: 'pointer', color: 'blue' }}
                                                        onClick={() => handlePostClick(report.post)} // Nhấn để chuyển đến PostLink
                                                    >
                                                        {report.post}
                                                    </td>                                                    <td style={styles.td}>{report.reporter_username}</td>
                                                    <td style={styles.td}>{report.reason}</td>
                                                    <td style={styles.td} onClick={() => toggleStatusDropdown(report.id)}>
                                                        <span style={getStatusStyle(report.status_display)}>
                                                            {report.status_display}
                                                        </span>
                                                        {isDropdownOpen === report.id && (
                                                            <div style={styles.dropdown}>
                                                                <div
                                                                    style={{ ...styles.dropdownItem, ...styles.processedItem }}
                                                                    onClick={() => handleStatusChange(report.id, 'processed')}
                                                                >
                                                                    Không vi phạm
                                                                </div>
                                                                <div
                                                                    style={{ ...styles.dropdownItem, ...styles.rejectedItem }}
                                                                    onClick={() => handleStatusChange(report.id, 'rejected')}
                                                                >
                                                                    Vi phạm
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>

                                                    <PopupMessage message={popupMessage} onClose={() => setPopupMessage(null)} />

                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p style={styles.noReport}>Không có báo cáo nào.</p>
                                )}
                            </div>
                        )}


                    </Card.Body>
                </Card>
            </div>

            {/* Sidebar bên phải */}
            <div style={{ flex: 2, ...css.sidebar }}>
                <h4>Tùy chọn</h4>
                <Button
                    variant="primary"
                    onClick={() => fetchDataWithLoading(fetchCategories)} // Gọi hàm dùng chung với fetchCategories
                    disabled={isLoading}
                    style={css.button}
                >
                    {isLoading ? (
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />
                    ) : (
                        'Danh mục'
                    )}
                </Button>

                <Button
                    variant="primary"
                    onClick={() => fetchDataWithLoading(fetchTopics)} // Gọi hàm dùng chung với fetchTopics
                    disabled={isLoading}
                    style={css.button}
                >
                    {isLoading ? (
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />
                    ) : (
                        'Chủ đề'
                    )}
                </Button>


                <Button
                    variant="primary"
                    onClick={() => fetchDataWithLoading(fetchPetpost)} // Gọi hàm dùng chung với fetchTopics
                    disabled={isLoading}
                    style={css.button}
                >
                    {isLoading ? (
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />
                    ) : (
                        'Bài viết kiến thức'
                    )}
                </Button>

                <Button
                    variant="primary"
                    onClick={() => {
                        setActiveSection('reports'); // Chuyển sang phần báo cáo
                        fetchReports(); // Gọi hàm lấy dữ liệu báo cáo
                    }}
                    disabled={isLoading}
                    style={css.button}
                >
                    {isLoading ? (
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    ) : (
                        'Báo cáo vi phạm'
                    )}
                </Button>



                <Button
                    variant="danger"
                    onClick={handleLogout}
                    style={css.button}
                >
                    Logout
                </Button>
            </div>





            {/* Modal for adding new category */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Thêm Category Mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={addCategory}>
                        <Form.Group controlId="formCategoryName">
                            <Form.Label>Category Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter category name"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                            />
                            {error && <small className="text-danger">{error}</small>}
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">
                            Thêm Category
                        </Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};



const styles = {

    popup: {
        position: 'fixed',
        bottom: '30px', // Tăng khoảng cách từ dưới lên để dễ nhìn hơn
        right: '30px', // Tăng khoảng cách từ phải sang
        padding: '15px 25px', // Tăng padding cho rộng hơn
        backgroundColor: '#87CEFA', // Thay đổi màu nền sang xanh đậm (hoặc màu khác nổi bật)
        color: '#fff', // Chữ trắng để dễ đọc trên nền tối
        borderRadius: '12px', // Tăng độ bo tròn góc cho mềm mại
        zIndex: 1000,
        textAlign: 'center',
        fontSize: '16px', // Tăng kích thước chữ để dễ đọc hơn
        fontWeight: 'bold', // Làm chữ đậm hơn để nổi bật
        animation: 'fade-in-out 2s ease', // Hiệu ứng mờ dần
        opacity: 0.95, // Tạo chút hiệu ứng trong suốt nhẹ
    },
    reportContainer: {
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        border: '1px solid #ddd',
        maxHeight: '500px',
        overflowY: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        backgroundColor: '#fff',
    },
    th: {
        padding: '12px',
        backgroundColor: '#f2f2f2',
        borderBottom: '2px solid #ddd',
        fontWeight: 'bold',
    },
    tr: {
        borderBottom: '1px solid #ddd',
    },
    td: {
        padding: '10px',
        borderBottom: '1px solid #ddd',
        cursor: 'pointer', // Thêm con trỏ để biết có thể nhấn
        position: 'relative', // Để menu dropdown hiển thị ngay trên ô
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: '0',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 100,
        width: '150px',
    },
    dropdownItem: {
        padding: '10px',
        cursor: 'pointer',
        borderBottom: '1px solid #ddd',
        backgroundColor: '#fff',
        transition: 'background-color 0.2s',
    },
    dropdownItemHover: {
        backgroundColor: '#f0f0f0',
    },
    noReport: {
        fontStyle: 'italic',
        color: '#777',
        textAlign: 'center',
        padding: '20px',
    },
    dropdownItem: {
        padding: '5px',
        borderRadius: '5px',
        cursor: 'pointer',
        marginBottom: '5px',
        transition: 'background-color 0.3s ease, color 0.3s ease'
    },
    processedItem: {
        color: '#155724', // Màu xanh đậm cho "Đã giải quyết"
        backgroundColor: '#d4edda', // Nền xanh nhạt mặc định
        ':hover': {
            backgroundColor: '#c3e6cb', // Nền xanh đậm hơn khi hover
            color: '#0b2e13', // Xanh đậm khi hover
        }
    },
    rejectedItem: {
        color: '#721c24', // Màu đỏ đậm cho "Bị từ chối"
        backgroundColor: '#f8d7da', // Nền đỏ nhạt mặc định
        ':hover': {
            backgroundColor: '#f5c6cb', // Nền đỏ đậm hơn khi hover
            color: '#491217', // Đỏ đậm hơn khi hover
        }
    }
};




// Hàm chứa CSS
const css = {
    btnCreatePetpost: {
        width: 'auto',
        minWidth: '120px',
        backgroundColor: '#28a745',
        borderColor: '#28a745',
        borderRadius: '4px',
        padding: '10px 15px',
        fontWeight: 'bold',
        marginTop: '10px',
        height: '40px',
        marginTop: '20px'
    },
    deleteButtonTopic: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    listItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        borderBottom: '1px solid #ddd',
    },

    column: {
        padding: '5px 10px',
        textAlign: 'left',
    },
    noReport: {
        fontStyle: 'italic',
        color: '#777',
    },
    petPostsSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '20px',
    },

    petPostsHeader: {
        alignSeft: 'flex-start',
        marginBottom: '10px',
    },

    petPostList: {
        marginTop: '20px',
        width: '700px'
    },
    petPostItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        borderBottom: '1px solid #ddd',
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
        backgroundImage: `url(${bacMor})`, // Thay 'bacMor' bằng đường dẫn của ảnh nền
        backgroundSize: 'cover', // Để ảnh phủ kín toàn bộ container
        backgroundPosition: 'center', // Để căn giữa ảnh trong container
        backgroundRepeat: 'no-repeat', // Không lặp lại ảnh
    },

    // backgroundImage: `url(${bacMor})`,
    // backgroundSize: 'cover', // Adjusts the image to cover the entire container
    // backgroundPosition: 'center', // Centers the image within the container
    // height: '100vh', // Adjust as needed for container height
    // width: '100%', // Adjust as needed for container width
    // display: 'flex',
    // alignItems: 'center',
    // justifyContent: 'center'

    sidebar: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        height: '100vh',
        borderLeft: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },


    button: {
        width: '100%', // Đặt độ rộng của nút bằng nhau
        margin: '5px 0', // Thêm khoảng cách giữa các nút
        display: 'flex',
        justifyContent: 'center', // Căn giữa chữ của nút
        alignItems: 'center',
        padding: '10px 0'
    },
    mainContent: {
        padding: '20px',
        paddingLeft: '15%',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        paddingLeft: '290px'
    },
    alertPopup: {
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '10px',
        display: 'inline-block',
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 999,
        transition: 'opacity 0.5s ease-out',
    },

    fadeOut: {
        opacity: 0,
    },

    alertSuccess: {
        backgroundColor: '#d4edda',
        color: '#155724',
    },

    alertError: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
    },

    petPostButton:
    {
        backgroundColor: 'blue',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '5px',
        cursor: 'pointer',
        margin: '0 5px',
    },
    petPostButtonDel:
    {
        backgroundColor: 'red',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '5px',
        cursor: 'pointer',
        margin: '0 5px',
    },


    card: {
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '10px',
        padding: '20px',
    },
    editButton: {
        padding: '5px 10px',
        backgroundColor: 'blue', // Màu xanh cho nút sửa
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },

    editButtonTopic: {
        backgroundColor: 'blue',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '5px',
        cursor: 'pointer',
    },

    deleteButton: {
        padding: '5px 10px',
        backgroundColor: '#f44336', // Màu đỏ cho nút xóa
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    categoryList: {
        listStyle: 'none',
        padding: 0,
        // margin: '20px 0',
    },

    headerFunction: {
        display: 'flex',
        gap: '200px',
        padding: 0,
    },

    categoryItem: {
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between', // Giúp các nút nằm cạnh nhau
        alignItems: 'center',
        backgroundColor: '#fff',
        marginBottom: '10px',
        borderRadius: '8px', // Bo góc thẻ category
        transition: 'box-shadow 0.3s ease-in-out', // Hiệu ứng mượt mà khi hover
    },

    buttonGroup: {
        display: 'flex',
        gap: '10px', // Khoảng cách giữa nút Sửa và Xóa
        justifyContent: 'center',

    },

    categoryItemHover: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Shadow nhẹ

    },

    headerRow: {
        display: 'flex',
        justifyContent: 'space-between', // Căn đều hai thẻ ra hai đầu
        alignItems: 'center', // Căn giữa theo chiều dọc
        marginBottom: '20px', // Khoảng cách dưới
    },
    addButton: {
        width: 'auto',
        minWidth: '120px',
        backgroundColor: '#28a745',
        borderColor: '#28a745',
        borderRadius: '4px',
        padding: '10px 15px',
        fontWeight: 'bold',
        marginTop: '10px',
    },

    addButtonHover: {
        backgroundColor: '#218838',
    },

    categoryName: {
        padding: '10px 20px', // Khoảng cách giữa text và border
        backgroundColor: '#fff', // Màu nền cho category
        borderRadius: '8px', // Bo tròn góc
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Hiệu ứng shadow nhẹ
        transition: 'background-color 0.3s ease-in-out', // Hiệu ứng mượt mà khi hover
        display: 'flex', // Đặt flexbox để căn chỉnh các phần tử
        justifyContent: 'space-between', // Tạo khoảng cách giữa tên và nút
        alignItems: 'center', // Căn giữa theo chiều dọc
        width: '100%', // Kéo dài ra toàn chiều ngang
    },

    categoryNameHover: {
        backgroundColor: '#f0f0f0', // Màu nền khi hover
    },
    addButtonHover: {
        backgroundColor: '#218838',
    },

    alertPopup: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        minWidth: '250px',
        zIndex: 9999,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        opacity: 1,
        transition: 'opacity 0.5s ease-in-out',
    },

    fadeOut: {
        opacity: 0,
        transition: 'opacity 0.5s ease-in-out',
    },
};


export default Moderator;
