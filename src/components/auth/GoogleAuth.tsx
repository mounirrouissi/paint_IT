import { GoogleLogin } from '@react-oauth/google';

const GoogleAuth: React.FC = () => {
    

    return (
        
<GoogleLogin
  onSuccess={(credentialResponse: any) => {
    console.log(credentialResponse);
  }}
  onError={() => {
    console.log('Login Failed');
  }}
/>
    );
}

export default GoogleAuth;
