/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import { useContext } from "react";
import { Link } from 'react-router-dom';

import { MyUserContext, MyDispatchContext } from "../../configs/MyContext";

const Menu = ({ openMenu }) => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);
  
  const handleLogout = () => {
    dispatch({ type: "logout" });
  };

  return (
    <div css={styles} className={openMenu ? "menu" : "hidden"}>
      <a><Link to="/">Home</Link></a>
      {user ? (
        <div className="user-section">
          <a><Link to="/info">{user.name}</Link></a>
          <a onClick={handleLogout}><Link to="/">Đăng xuất</Link></a>
        </div>
      ) : (
        <a href="/login">Đăng nhập</a>
      )}
    </div>
  );
};


const styles = css`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
  a {
    text-decoration: none;
    text-transform: uppercase;
    display: inline-block;
    font-size: 15px;
    font-weight: 600;
    color: gray;
    margin: 0 22px;
    position: relative;
    transition: color 300ms ease-in-out, transform 300ms ease-in-out;

    /* Hiệu ứng khi hover vào nút */
    &::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: -6px;
      transform: translateX(-50%) skewX(-20deg); /* Tạo hình thang */
      width: 60%;
      height: 4px;
      background-color: transparent;
      transition: all 300ms ease-in-out;
    }

    &:hover {
      color: #AEE4FF; /* Màu khi hover */
      transform: scale(1.1); /* Phóng to chữ khi hover */

      &::after {
        background-color: #AEE4FF; /* Màu cạnh dưới khi hover */
      }
    }
  }

  /* Tạo viền cho các liên kết Home và Đăng nhập */
  .bordered-link {
    padding: 5px 12px; /* Khoảng cách giữa viền và nội dung */
    border: 2px solid #AEE4FF; /* Viền màu AEE4FF */
    border-radius: 4px;
    transition: background-color 300ms ease, color 300ms ease;

    &:hover {
      background-color: #AEE4FF;
      color: #000; /* Đổi màu chữ khi hover */
    }
  }

  .user-section {
    display: flex;
    align-items: center;
    a {
      margin: 0 22px;
    }
  }

  @media (max-width: 1225px) {
    flex-direction: column;
    padding: 80px 40px;
    z-index: 30;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 1;
    min-height: 96vh;
    width: 100%;
    max-width: 320px;
    transition: left 100ms ease-in-out, opacity 100ms ease-in-out;

    &.hidden {
      left: -500px;
      opacity: 0;
    }

    a {
      margin: 20px 0;
      font-size: 25px;
      text-align: left;
      user-select: none;
    }
  }
`;

export default Menu;
