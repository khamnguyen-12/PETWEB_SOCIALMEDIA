import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap'; // Giả sử bạn dùng React-Bootstrap
import { authAPI, endpoints } from '../../configs/APIs';

const Report = (showModal) => {
    const { postId } = useParams(); // Lấy postId từ URL
    const [reportReason, setReportReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const scrollPosition = useRef(0);  // Dùng để lưu vị trí scroll của người dùng

    useEffect(() => {
        scrollPosition.current = window.scrollY;
        console.log('Vị trí scroll đã lưu:', scrollPosition.current);
    }, []);

    const handleSubmitReport = async () => {
        // Kiểm tra nếu lý do báo cáo bị bỏ trống
        if (!reportReason.trim()) {
            alert('Vui lòng nhập lý do báo cáo');
            console.log('Lý do báo cáo bị bỏ trống.'); // Log khi lý do bị bỏ trống
            return;
        }

        // Bắt đầu quá trình gửi báo cáo, disable nút gửi
        setIsSubmitting(true);
        console.log('Đang gửi báo cáo bài viết:', postId); // Log khi bắt đầu gửi báo cáo
        console.log('Lý do báo cáo:', reportReason); // Log lý do báo cáo

        try {
            // Gửi yêu cầu POST lên API
            const response = await authAPI().post(endpoints['user_report'](postId), {
                reason: reportReason,
            });

            // Log phản hồi từ API
            console.log('Phản hồi từ API:', response);

            // Nếu phản hồi từ server thành công
            if (response.status === 201) {
                alert('Báo cáo đã được gửi thành công');
                console.log('Báo cáo bài viết thành công:', postId); // Log khi gửi thành công
                closeModal(); // Đóng modal sau khi gửi thành công
                // Reset lại lý do báo cáo
                setReportReason('');

                // Điều hướng về trang trước và cuộn lại vị trí cũ
                navigate('/');  // Quay lại trang trước đó
                setTimeout(() => {
                    window.scrollTo(0, scrollPosition.current);  // Cuộn về vị trí đã lưu
                    console.log('Chuyển về vị trí bài viết:', scrollPosition.current);
                }, 100);  // Chờ một chút để trang load trước khi cuộn



            } else {
                alert('Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.');
                console.log('Phản hồi không thành công từ API. Status:', response.status); // Log nếu không thành công
            }
        } catch (error) {
            // Xử lý lỗi khi gửi báo cáo
            console.error('Lỗi khi gửi báo cáo:', error); // Log lỗi chi tiết
            alert('Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.');
        } finally {
            // Cho phép người dùng gửi lại sau khi xử lý xong
            setIsSubmitting(false);
            console.log('Quá trình gửi báo cáo đã kết thúc.'); // Log khi quá trình kết thúc
        }
    };



    const closeModal = () => {
        // Điều hướng về trang trước và cuộn lại vị trí cũ
        navigate(-1);  // Quay lại trang trước đó
        setTimeout(() => {
            window.scrollTo(0, scrollPosition.current);  // Cuộn về vị trí đã lưu
            console.log('Chuyển về vị trí bài viết:', scrollPosition.current);
        }, 100);  // Chờ một chút để trang load trước khi cuộn
        setReportReason(''); // Reset lý do báo cáo

    };

    const commonReasons = [
        'Nội dung không phù hợp',
        'Nội dung giả mạo',
        'Spam hoặc quảng cáo',
        'Ngôn từ thù địch',
        'Xâm phạm quyền riêng tư'
    ];

    const handleReasonClick = (reason) => {
        setReportReason(reason); // Đặt lý do báo cáo khi người dùng nhấn vào
    };


    return (
        <div style={css.container}>
            <Modal show={showModal} onHide={closeModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Báo cáo bài viết</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={css.reasonContainer}>
                        {commonReasons.map((reason, index) => (
                            <Button
                                key={index}
                                variant="outline-secondary"
                                onClick={() => handleReasonClick(reason)}
                                style={css.reasonButton}
                            >
                                {reason}
                            </Button>
                        ))}
                    </div>
                    <textarea
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder="Nhập lý do báo cáo..."
                        rows="4"
                        style={css.textarea}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <div style={css.buttonGroup}>
                        <Button
                            onClick={handleSubmitReport}
                            disabled={isSubmitting}
                            style={isSubmitting ? { ...css.button, ...css.buttonDisabled } : css.button}
                        >
                            {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
                        </Button>
                        <Button variant="secondary" onClick={closeModal} style={css.button}>
                            Hủy
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const css = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '15px',
    },
    button: {
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
    },
    reasonContainer: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '15px', // Khoảng cách dưới cùng
    },
    reasonButton: {
        marginBottom: '10px', // Khoảng cách giữa các nút lý do
    },
    textarea: {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    button: {
        // Các style cho nút
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
    }

};

export default Report;
