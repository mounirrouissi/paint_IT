import React, { Component, useContext, useEffect, useState } from 'react';
import { ACCESS_TOKEN, API_BASE_URL } from '../../../constants/index';
import { redirect } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import useAuth, { AuthContext, User } from '../AuthContext';
import { getCurrentUser, login } from '../../../util/APIUtils';

 

const OAuth2RedirectHandler: React.FC = () => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const token = params.get('token');
    const error = params.get('error');
    
    type CurrentUserType = any; // Replace 'any' with the correct type

     
      const [authenticated, setAuthenticated] = useState(false);
      const [currentUser, setCurrentUser] = useState<CurrentUserType | null>(null);
      const [loading, setLoading] = useState(true);
      const auth = useAuth();

     /*  const loadCurrentlyLoggedInUser = () => {
        getCurrentUser()
        .then((response: CurrentUserType) => {
          setCurrentUser(response);
          setAuthenticated(true);
          setLoading(false);
        }).catch((error: any) => {
          setLoading(false);
        });    
      } */
    
      const handleLogout = () => {
        localStorage.removeItem(ACCESS_TOKEN);
        setAuthenticated(false);
        setCurrentUser(null);
      }
     const getUser = async () =>{
        const response = await  auth.loadCurrentlyLoggedInUser()
        return response
     }
      useEffect(() => {
        if (token) {
            localStorage.setItem(ACCESS_TOKEN, token);
        }      
        getUser()
        
        navigate('/')
        // loadCurrentlyLoggedInUser();
      }, []);
    
      if(loading) {
        return(
<>
        <p>Loading..............</p>
        </>)
      }
    return (<></>);
  };
  


/* 
    const getUrlParameter = (name: string) => {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');

        var results = regex.exec(props.location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    const error = getUrlParameter('error'); */







export default OAuth2RedirectHandler;

        
