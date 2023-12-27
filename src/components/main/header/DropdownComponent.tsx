import React, { useEffect } from "react" ;
import useAuth from "../../auth/AuthContext";

export default function DropdownComponent({ handleLogout }) {
 const auth = useAuth()

 useEffect(() =>{ console.log(auth.user)  });
  return (
    <div className="absolute top-15 z-50  right-10  bg-white border border-gray-100 rounded-md shadow-lg">
          <div className="p-2 ">
            <a href="#" className=" flex flex-row gap-8 px-4 py-2 text-sm text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-700" >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
             <p className="">{auth.user.email}</p>
            </a>
            
            <a href="#" className=" flex flex-row gap-8 px-4 py-2 text-sm text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-700" >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-archive"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
            <p className="">Archive</p>
            </a>
            <a className=" flex flex-row gap-8 px-4 py-2 text-sm text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-700" onClick={handleLogout}  >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
</svg>

            <p className="">Logout</p>
            </a>
          </div>
 </div>
  );
}
