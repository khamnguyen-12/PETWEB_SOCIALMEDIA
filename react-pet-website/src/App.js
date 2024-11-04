import React, { useState, useReducer, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Login from "./components/Account/Login";
import Signup from './components/Account/Signup';
import MainContent from './components/MainContent/MainContent';
import MyUserReducer from './components/MyReducer/MyUserReducer';
import cookie from "react-cookies";
import { MyDispatchContext, MyUserContext } from './configs/MyContext';
import { SnackbarProvider } from 'notistack';
import Profile from './components/Account/Profile';
import DetailPost from './components/Post/DetailPost';
import Comment from './components/Post/Comment';
import Moderator from './components/Account/Moderator';
import { GoogleOAuthProvider } from '@react-oauth/google';

import btnHome from './images/house.png';
import btnZoo from './images/pets.png';
import btnLearn from './images/learning.png';
import btnProfile from './images/profile.png';
import logo from './images/logo.png';
import Petpost from './components/Post/Petpost';
import Report from './components/MainContent/Report';
import PostLink from './components/ModeratorLink/PostLink'
import ProfileLink from './components/ModeratorLink/ProfileLink'
import adminPNG from './images/setting.png'
import Admin from './components/Admin/Admin';
import AddModerator from './components/Admin/AddModerator';

import PostSearch from './components/MainContent/PostSearch';

const clientID = "29867196837-3t0kp776q00v5nkjlrrorlrc786p1ke7.apps.googleusercontent.com";

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, cookie.load("user") || null);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (user) {
      setShowSidebar(true);
    } else {
      setShowSidebar(false);
    }
  }, [user]);


  //   useEffect(() => {
  //     function start() {
  //       gapi.client.init({
  //         clientID: clientID,
  //         scope: ""
  //       })
  //     }
  //     gapi.load('client:auth2', start);
  //   });

  // return (
  //   <div className='App'>
  //     <LoginBtn />

  //     <LogoutBtn />

  //   </div>
  // )
  // }
  // export default App;


  //Phần chính 
  const ProtectedRoute = ({ user, roleRequired, children }) => {
    if (!user || user.role !== roleRequired) {
      return <Navigate to="/" replace />
    }

    return children;
  }

  const isActive = (path, currentPath) => path === currentPath;

  return (


    <GoogleOAuthProvider clientId={clientID}>

      <SnackbarProvider maxSnack={3}>
        <BrowserRouter>
          <MyUserContext.Provider value={user}>
            <MyDispatchContext.Provider value={dispatch}>
              <LocationAwareSidebar showSidebar={showSidebar} isActive={isActive} user={user} />

              <Routes>
                <Route
                  exact
                  path='/'
                  element={user ? <MainContent /> : <Navigate to="/login" replace />}
                />
                {/* <Route
                  path='/login'
                  element={
                    <Login />
                  }
                /> */}
                <Route path='/login' element={<Login setShowSidebar={setShowSidebar} />} />


                <Route path='/signup' element={<Signup />} />
                <Route path='/profile' element={<Profile />} />
                <Route path="/post/:id" element={<DetailPost />} />
                <Route path="/post/:id/comments" element={<Comment />} />
                <Route path="/petpost/" element={<Petpost />} />
                <Route path="/report/:postId" element={<Report />} />
                <Route path="/post-link/:postId" element={<PostLink />} />
                <Route path="/profile-link/:userId" element={<ProfileLink />} />
                <Route path="/add-moderator/" element={<AddModerator />} />
                <Route path="/posts/:id" element={<PostSearch />} />

                <Route path='/admin' element={
                  <ProtectedRoute user={user} roleRequired={3}>
                    <Admin />
                  </ProtectedRoute>
                } />
                <Route path='/moderator' element={
                  <ProtectedRoute user={user} roleRequired={2}>
                    <Moderator />
                  </ProtectedRoute>
                } />
              </Routes>
              {!user && <Footer />}
            </MyDispatchContext.Provider>
          </MyUserContext.Provider>
        </BrowserRouter>
      </SnackbarProvider>

    </GoogleOAuthProvider>

  );
};

// Component xử lý Sidebar với useLocation
const LocationAwareSidebar = ({ showSidebar, isActive, user }) => {
  const location = useLocation(); // Đặt useLocation trong BrowserRouter ngữ cảnh đúng

  return showSidebar ? (
    <div style={sidebarStyles}>
      <Link to="/">
        <img src={logo} alt="LOgo" style={logoStyles} />
      </Link>
      <div style={buttonWrapperStyles}>
        <Link to="/" style={buttonLinkStyles(isActive('/', location.pathname))}>
          <img src={btnHome} alt="Trang chủ" style={iconStyles} />
          Trang chủ
        </Link>
        <Link to="/petpost/" style={buttonLinkStyles(isActive('/learn', location.pathname))}>
          <img src={btnLearn} alt="Kiến thức" style={iconStyles} />
          Kiến thức
        </Link>
        <Link to="/zoo" style={buttonLinkStyles(isActive('/zoo', location.pathname))}>
          <img src={btnZoo} alt="Vườn thú" style={iconStyles} />
          Vườn thú
        </Link>
      </div>
      <div style={buttonWrapperStyles}>
        {/* Kiểm tra role của người dùng */}
        {user?.role === 3 ? (
          <Link to="/admin" style={buttonLinkStyles(isActive('/admin', location.pathname))}>
            <img src={adminPNG} alt="Admin" style={iconStyles} />
            Trang Quản lý (Admin)
          </Link>
        ) : user?.role === 2 ? (
          <Link to="/moderator" style={buttonLinkStyles(isActive('/moderator', location.pathname))}>
            <img src={btnProfile} alt="Moderator" style={iconStyles} />
            Trang Cá nhân (Moderator)
          </Link>
        ) : (
          <Link to="/profile" style={buttonLinkStyles(isActive('/profile', location.pathname))}>
            <img src={btnProfile} alt="Trang Cá nhân" style={iconStyles} />
            Trang Cá nhân
          </Link>
        )}
      </div>
    </div>
  ) : (
    <Navbar />
  );
};

// Các style cho Sidebar và link button
const buttonLinkStyles = (isActive) => ({
  display: 'flex',
  width: '100%',
  padding: '10px 20px',
  textDecoration: 'none',
  color: isActive ? '#fff' : '#007bff',
  fontSize: '18px',
  backgroundColor: isActive ? '#1769ff' : '#e9ecef',
  borderRadius: '33px',
  margin: '10px 0',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

const sidebarStyles = {
  background: 'linear-gradient(66deg, #1ab7ea, #1769ff)',
  position: 'fixed',
  top: '25px',
  left: '200px',
  width: '200px',
  height: '80%',
  padding: '20px',
  boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  borderRadius: '33px',
  justifyContent: 'center',
  left: '44px',
};
const logoStyles = {
  width: '150px', // Kích thước logo
  // marginBottom: '10px', // Khoảng cách dưới logo
  borderRadius: '33px',

};
const iconStyles = {
  width: '20px',
  height: '20px',
  marginRight: '10px',
};

const buttonWrapperStyles = {
  width: '100%',
  textAlign: 'center',
  marginBottom: '20px',
};

export default App;