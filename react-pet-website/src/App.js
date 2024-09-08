import React, { useState, useReducer, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Login from "./components/Account/Login";
import Signup from './components/Account/Signup';
import MainContent from './components/MainContent/MainContent';
import Info from './components/Navbar/Info';
import MyUserReducer from './components/MyReducer/MyUserReducer';
import cookie from "react-cookies";
import { MyDispatchContext, MyUserContext } from './configs/MyContext';
import { SnackbarProvider } from 'notistack';
import Profile from './components/Account/Profile';
import DetailPost from './components/Post/DetailPost';
import Comment from './components/Post/Comment';

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, cookie.load("user") || null);
  const [showMainContent, setShowMainContent] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (user) {
      setShowSidebar(true);
    } else {
      setShowSidebar(false);
    }
  }, [user]);

  return (
    <SnackbarProvider maxSnack={3}>
      <BrowserRouter>
        <MyUserContext.Provider value={user}>
          <MyDispatchContext.Provider value={dispatch}>
            {showSidebar ? (
              <div style={sidebarStyles}>
                <div style={buttonWrapperStyles}>
                  <Link to="/" style={buttonLinkStyles}>Trang chủ</Link>
                </div>
                <div style={buttonWrapperStyles}>
                  <Link to="/profile" style={buttonLinkStyles}>Trang Cá nhân</Link>
                </div>
              </div>
            ) : (
              <Navbar />
            )}

            <Routes>
              <Route exact path='/' element={<MainContent />} /> 
              <Route
                path='/login'
                element={
                  <Login
                    setShowMainContent={setShowMainContent}
                    setShowSidebar={setShowSidebar} 
                  />
                }
              />
              {/* <Route path='/info' element={<Info />} /> */}
              <Route path='/signup' element={<Signup />} />
              <Route path='/profile' element={<Profile />} />
              <Route path="/post/:id" element={<DetailPost />} />
              <Route path="/post/:id/comments" element={<Comment />} /> {/* Thêm Route cho Comment */}

            </Routes>
            {!user && <Footer />}
          </MyDispatchContext.Provider>
        </MyUserContext.Provider>
      </BrowserRouter>
    </SnackbarProvider>
  );
}

const sidebarStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '200px',
  height: '100%',
  backgroundColor: '#f5f5f5',
  padding: '20px',
  boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const buttonWrapperStyles = {
  margin: '10px 0',
  width: '100%', 
  textAlign: 'center',
};

const buttonLinkStyles = {
  display: 'block', 
  width: '100%',
  padding: '10px 0',
  textDecoration: 'none',
  color: '#007bff',
  fontSize: '18px',
  backgroundColor: '#e9ecef',
  borderRadius: '4px',
};

export default App;
