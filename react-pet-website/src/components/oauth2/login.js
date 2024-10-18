import GoogleLogin from "react-google-login";
import React from 'react';

const clientId = "29867196837-3t0kp776q00v5nkjlrrorlrc786p1ke7.apps.googleusercontent.com";


const onSuccess = (res) => {
    {
        console.log("Login success! Current user: ", res.profilePbj);
        console.log("User token: ", res.tokenId); // Hiển thị token của người dùng

    }
}
const onFailure = (res) => {
    {
        console.log("Login failed! res: ", res);
    }
}
function Login() {
    return (
        <div id="signInButton">
            <GoogleLogin
                clientId={clientId}
                buttonText="Login"
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy={'single_host_origin'}
                isSignedIn={true}

            />
        </div>
    )
}

export default Login;