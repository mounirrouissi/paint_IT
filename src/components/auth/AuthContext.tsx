import React, { FC, createContext, useContext, useEffect, useState } from 'react';
import { feedback, getCurrentUser, login, signup } from './../../util/APIUtils';
import { ACCESS_TOKEN } from '../../constants';
import { toast } from 'react-toastify';

export interface User {
 email: string;
 name?: string;
 imageUrl?: string;
}



interface AuthProviderProps {
 children: React.ReactNode;
}

export const AuthContext = createContext<any | undefined>(undefined);


export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
 const [user, setUser] = useState<User | null>(null);
 const [loading, setLoading] = useState(true);
 const [authenticated, setAuthenticated] = useState(false);


 const loadCurrentlyLoggedInUser=()=> {
  getCurrentUser()
  .then(response => {
    console.log("REsponse "+ response)
    setUser(response);
    setAuthenticated(true);
    setLoading(false);
  })
  } 


  const loginUser = async (loginRequest:  { email:string, password:string }) => {
     try {
       await login(loginRequest)
       .then(response => {
        localStorage.setItem(ACCESS_TOKEN, response.accessToken);
        setUser({email: response.user.email,name:response.user.name,imageUrl:''});
        setAuthenticated(true);
        setLoading(false);
       });
     }
     catch (error) {
       console.error(error);
       toast.error('Login failed');
     }
  };

 const signupUser = async (signupRequest: any) => {
   try {
     await signup(signupRequest)
     .then(response => {})
     ;
   } catch (error) {
     console.error(error);
   }
 };
 
 const feedbackUser = async (feedbackRequest: any) => {
   try {
     await feedback(feedbackRequest);
   } catch (error) {
     console.error(error);
   }
 };

 const logout = () => {
   setUser(null);
   localStorage.removeItem(ACCESS_TOKEN);
   setAuthenticated(false);
   setUser(null);
 };

 return (
   <AuthContext.Provider value={{ user,loadCurrentlyLoggedInUser, loginUser, signupUser, logout,loading,authenticated,feedbackUser }}>
     {children}
   </AuthContext.Provider>
 );
};


export default function useAuth(){
return useContext(AuthContext)
}