/** @jsx jsx */
import { css, jsx, keyframes } from '@emotion/core';
import { useState } from 'react';
import logoLogin from "../../images/logo.png";

const NavbarLogo = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = () => {
        setIsLoading(true);
        setTimeout(() => {
            window.location.href = 'http://localhost:3000/login';
        }, 1000); // Thời gian chờ hiệu ứng loading trước khi chuyển hướng
    };

    return (
        <div css={logoContainer} onClick={handleClick}>
            <img src={logoLogin} alt="" css={logoStyles} />
            {isLoading && <div css={loadingCircle}></div>}
        </div>
    );
};

// Tạo khung hình bình hành trên và dưới logo
const logoContainer = css`
  position: relative;
  display: inline-block;
  cursor: pointer;

  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 8px;
    background-color: #AEE4FF;
    transform: skewX(-20deg);
  }

  &::before {
    top: -5px;
  }

  &::after {
    bottom: -5px;
  }
`;

// Hiệu ứng xoay vòng tròn
const spinAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Vòng tròn xoay loading
const loadingCircle = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.2);
  border-top-color: #333;
  border-radius: 50%;
  animation: ${spinAnimation} 1s linear infinite;
`;

const logoStyles = css`
  max-height: 90px;
  width: auto;
  display: block;
`;

export default NavbarLogo;
