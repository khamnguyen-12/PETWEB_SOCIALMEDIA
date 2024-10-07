    import axios from "axios";
    import cookie from "react-cookies";

    // export const BASE_URL = 'http://192.168.1.233:8000/';
    export const BASE_URL = 'http://127.0.0.1:8000/';

    export const endpoints = {
    'login': '/o/token/',
    'current_user': '/users/current_user/',
    'signup': '/users/',
    'patch_profile': (id) => `/users/${id}/`,
    'user_post' : '/users/list_posts/',
    'newest_post' : '/posts/list-newest-posts/',
    'create_post' : '/posts/',
    'react_post': (id) => `/posts/${id}/reacts/`,
    'list_react' : '/reacts/',
    'detail_post' : (id) => `/posts/${id}/`,
    'list_comments' : (id) => `/comments/${id}/list-comments/`,
    'add_comment' : (id) => `/comments/${id}/add-comment/`,
    'delete_cmt' : (cmtId) => `/comments/${cmtId}/delete-comment/`,
    'category' : '/categories/',
    'topic' : '/topics/',
    'function_category' : (id) => `/categories/${id}/deactivate/`,
    'update_category' : (id) => `/categories/${id}/update-name/`,
    'deactivate_topic' : (id) => `/topics/${id}/deactivate/`,
    'edit_topic' : (id) => `/topics/${id}/`,
    'petpost' :'/petpost/',
    'delete_petpost' : (id) => `/petpost/${id}/deactive-petpost/`,
    'topic/petpost' : (id) => `/petpost/topic/${id}/`,
}   
    
    export const authAPI = () => {
        const token = cookie.load('token');
        console.log("Access Token:", token);  // Log token ra console

        return axios.create({
            baseURL: BASE_URL,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    export default axios.create({
        baseURL: BASE_URL
    });