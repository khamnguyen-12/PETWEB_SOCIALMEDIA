import GoogleLogin, { GoogleLogout } from "react-google-login";
import React from 'react';

const clientId = "29867196837-3t0kp776q00v5nkjlrrorlrc786p1ke7.apps.googleusercontent.com";

function Logout() {
    const onSuccess = () => {
    
        console.log("Log ouy succcessfull!");
    }

    return (
        <div id="signOutButton">
            <GoogleLogout
                clientId={clientId}
                buttonText="Logout"
                onLogoutSuccess={onSuccess}

            />


        </div>

    )

}

export default Logout;