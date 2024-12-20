/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import Container from "../Global/Container";
import FooterCard from "./FooterCard";
import Button from "../Global/Button/Button";

const Footer = () => {
    return (
        <footer css={styles}>
            <Container>
                <FooterCard cardHeading="PetWeb Social Media">
                    <div className="firstCard">
                        <p>Go Vap, TP HCM</p>
                        <a href="">+84 345 868 6868</a>
                        <a href="">hotel@gmail.com</a>
                        <div className="social">
                            <i class="fab fa-facebook-f"></i>
                            <i class="fab fa-twitter"></i>
                            <i class="fab fa-instagram"></i>
                            <i class="fab fa-pinterest-p"></i>
                            <i class="fab fa-youtube"></i>
                        </div>
                    </div>
                </FooterCard>
                <FooterCard cardHeading="Useful Links">
                    <div className="usefulLinks">
                        <a href="">Pricing</a>
                        <a href="">About</a>
                        <a href="">Gallery  </a>
                        <a href="">Liên hệ</a>
                    </div>
                </FooterCard>
                <FooterCard cardHeading="Subscribe">
                    <div className="subscribe">
                        <div className="input">
                            <input type="text" placeholder="Enter your Email" />
                            <Button />
                        </div>
                        <p>Esteem spirit temper too say adieus who direct esteem esteems luckily.</p>
                    </div>
                </FooterCard>
            </Container>
            <div className="copyright" style={ {paddingBottom: '9px'}}>
                <p>Copyright ©2020 All rights reserved | This template is made with <i class="far fa-heart"></i> by Colorlib</p>
            </div>
        </footer>
    )
}

const styles = css`
    width: 100%;
    background: #FFB0A9;

    .container {
        padding: 150px 0;
        max-width: 1200px;
        display: flex;
        border-bottom: 1px solid rgb(26, 26, 26);
        justify-content: space-between;
    }

    .footerCard {
        .cardHeading {
            color: #AEE4FF; /* Màu cho cardHeading */
            font-weight: bold;
            font-size: 18px;
        }

        .firstCard {
            display: flex;
            flex-direction: column;
            padding: 40px 0 0 0;

            p, a, .social i {
                color: #EE6457; /* Áp dụng màu cho tất cả văn bản ngoại trừ cardHeading */
            }

            a {
                padding: 10px 0 0 0;
                text-decoration: none;
                transition: 400ms ease-in-out;

                &:hover {
                    color: red;
                }
            }

            .social {
                display: flex;
                padding: 40px 0 0 0;

                i {
                    margin: 0 10px 0 0;
                    cursor: pointer;
                    transition: all 300ms ease-in-out;

                    &:hover {
                        color: red;
                    }
                }
            }
        }

        .usefulLinks {
            padding: 40px 0 0 0;
            display: flex;
            flex-direction: column;

            a {
                color: #EE6457; /* Màu cho các liên kết trong usefulLinks */
                padding: 10px 0 0 0;
                text-decoration: none;
                transition: 400ms ease-in-out;

                &:hover {
                    color: red;
                }
            }
        }

        .subscribe {
            padding: 40px 0 0 0;

            .input {
                position: relative;

                input {
                    height: 44px;
                    padding: 10px;
                    width: 100%;
                    border-radius: 10px;
                    border: none;
                    outline: none;
                }

                button {
                    position: absolute;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    padding: 10px 20px;
                    z-index: 20;
                    right: -42px;
                    border-radius: 10px;
                }
            }

            p {
                color: #EE6457; /* Màu cho văn bản trong subscribe */
                padding: 20px 0 0 0;
            }
        }
    }

    .copyright {
        p {
            padding: 20px 0;
            color: #EE6457; /* Màu cho văn bản trong copyright */
            text-align: center;

            i {
                color: red;
                cursor: pointer;
            }
        }
    }

    /* Responsive adjustments */
    @media(max-width: 700px) {
        .container {
            padding: 100px 0;
            flex-wrap: wrap;

            .footerCard {
                max-width: 200px;

                &:nth-child(3) {
                    max-width: 400px;
                    padding: 30px 0 0 0;
                }
            }
        }

        .copyright {
            max-width: 400px;
            margin: 0 auto;
        }
    }

    @media (min-width: 701px) and (max-width: 1000px) {
        .container {
            padding: 100px 0;
            flex-wrap: wrap;

            .footerCard {
                max-width: 300px;

                &:nth-child(3) {
                    max-width: 400px;
                    padding: 30px 0 0 0;
                }
            }
        }
    }

    @media (min-width: 1001px) and (max-width: 1200px) {
        .container {
            padding: 100px 0;
            flex-wrap: wrap;

            .footerCard {
                max-width: 200px;

                &:nth-child(3) {
                    max-width: 400px;
                    padding: 30px 0 0 0;
                }
            }
        }
    }
`;


export default Footer;