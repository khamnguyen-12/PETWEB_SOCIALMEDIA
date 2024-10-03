import React, { useState, useEffect, useContext } from 'react';
import { Modal, Form, Card, Button, Alert, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

import cookie from 'react-cookies';

import { MyDispatchContext } from '../../configs/MyContext';
import { authAPI, endpoints } from '../../configs/APIs';



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
    const [isLoadingCategories, setIsLoadingCategories] = useState(true); // Trạng thái loading cho combobox

    const [showTopicModal, setShowTopicModal] = useState(false);
    const [newTopic, setNewTopic] = useState('');
    const [petPosts, setPetPosts] = useState([]);  // Add state to store pet posts
    const [showWelcome, setShowWelcome] = useState(true);


    const [showModalPetpost, setShowModalPetPost] = useState(false); // State to control modal visibility


    const [formData, setFormData] = useState({
        title: '',
        content: '',
        author: '',
        image: null,
        topic: ''
    });
    const handleShow = () => setShowModalPetPost(true);
    const handleClose = () => setShowModalPetPost(false);

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

    // Gọi loadCategories khi component được tải
    useEffect(() => {
        setShowWelcome(true);
        loadCategories();

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
            author: post.author,
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




    return (
        <div style={css.container}>

            <Modal show={showWelcome} onHide={() => setShowWelcome(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>MỪNG TRỞ LẠI</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    HAVE A GOOD DAY MODERATOR
                    <span style={{ fontWeight: 'bold', fontSize: '1.3em' }}>
                        "{user.first_name} {user.last_name}"
                    </span>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowWelcome(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Phần hiển thị nội dung chính bên trái */}
            <div style={{ flex: 8, ...css.mainContent }}>
                <Card className="text-center">


                    <Card.Header as="h1">
                        {activeSection === 'categories' && `Trang Quản Lý Category`}
                        {activeSection === 'topics' && `Trang Quản Lý Topic`}
                        {activeSection === 'petpost' && `Trang Quản Lý PetPost`}

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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 className="mt-4">Categories</h3>
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
                                    <h3 className="mt-4">Topics</h3>
                                    <Button
                                        variant="success"
                                        style={css.addButton}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = css.addButtonHover.backgroundColor}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                                        onClick={handleAddTopicClick}
                                    >
                                        Thêm Topic
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
                                    {topics.map(topic => (
                                        <li key={topic.id} className="list-group-item" style={css.categoryItem}>
                                            <div style={css.categoryName}>
                                                {topic.name} - Danh mục: {topic.category?.name || 'No Category'}
                                                <div style={css.buttonGroup}>
                                                    <button
                                                        style={css.editButton}
                                                        onClick={() => editTopic(topic.id)}
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        style={css.deleteButton}
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
                                            className="mt-4" style={css.petPostsHeader}>Pet Posts</h3>

                                        <Button onClick={handleShow}> Tạo mới</Button>
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

                                                <Form.Group controlId="formAuthor">
                                                    <Form.Label>Author</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="author"
                                                        value={formData.author}
                                                        onChange={handleChange}
                                                        placeholder="Nhập tên tác giả"
                                                    />
                                                </Form.Group>

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
                                            {petPosts.map((post) => {
                                                // Kiểm tra nếu post.image là null hoặc không có giá trị, xử lý đường dẫn ảnh
                                                const imageUrl = post.image
                                                    ? post.image.startsWith('http')
                                                        ? post.image
                                                        : `https://res.cloudinary.com/dp2lb0arb/${post.image}`
                                                    : '/image/upload/https://vuipet.com/wp-content/uploads/2021/05/cho-husky.jpg'; // Đường dẫn đến ảnh mặc định

                                                return (
                                                    <li key={post.id} className="list-group-item" style={css.petPostItem}>
                                                        {/* Bỏ qua tiêu đề và nội dung để chỉ hiển thị tên topic và danh mục */}
                                                        <small>Title: {post.title} - Topic: {post.topic.name}</small>
                                                        {/* <img src={imageUrl}></img> */}


                                                        <Button style={css.petPostButton} onClick={() => { handleEditClick(post) }}>Sửa</Button>
                                                        <Button style={css.petPostButton} onClick={() => {
                                                            deletePetPost(post.id)
                                                        }}>Xóa</Button>


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


                    </Card.Body>
                </Card>
            </div>

            {/* Sidebar bên phải */}
            <div style={{ flex: 2, ...css.sidebar }}>
                <h4>Actions</h4>
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
                        'Show Categories'
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
                        'Show Topics'
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
                        'Show PetPost'
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

// Hàm chứa CSS
const css = {

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
        width: '100%', // Đảm bảo danh sách rộng 100% vùng hiển thị
        marginTop: '5px',
        listStyleType: 'none', // Loại bỏ ký hiệu gạch đầu dòng của ul
        padding: 0, // Xóa padding mặc định của ul
    },
    petPostItem: {
        padding: '10px 20px', // Khoảng cách trong của từng mục
        marginBottom: '10px', // Khoảng cách giữa các mục
        backgroundColor: '#fff', // Màu nền cho item
        borderRadius: '8px', // Bo góc
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Hiệu ứng đổ bóng nhẹ
        fontWeight: '70px',
        flexGrow: 1,
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
    },



    sidebar: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        height: '100vh',
        borderLeft: '1px solid #ddd',
    },

    mainContent: {
        padding: '20px',
        paddingLeft: '15%',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
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
        padding: '5px',
        margin: '5px',
    },
    card: {
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '10px',
        padding: '20px',
    },
    editButton: {
        padding: '5px 10px',
        backgroundColor: '#4CAF50', // Màu xanh cho nút sửa
        color: 'white',
        border: 'none',
        borderRadius: '4px',
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
        margin: '20px 0',
    },

    headerFunction: {
        display: 'flex',
        gap: '550px',
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
