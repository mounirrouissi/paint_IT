

import { ArrowLeftIcon, LoginIcon, LogoutIcon } from '@heroicons/react/outline'
import { useState } from 'react'
import Button from '../../Button'
import { languageTag, setLanguageTag } from '../../../paraglide/runtime'
import * as m from '../../../paraglide/messages'
import { ArchiveIcon } from '@heroicons/react/outline'
import DropdownComponent from './DropdownComponent'
import LoginComponent from '../../auth/LoginComponent'
import FeedbackButton from '../footer/FeedbackButton'
import useAuth from '../../auth/AuthContext'

interface HeaderProps {
    file: File | undefined;
    setFile: (file: File | undefined) => void;
    setOpenLoginForm1: (isOpen: boolean) => void;
    setShowAbout: (value: boolean) => void;

    
}

const HeaderComponent = ({ file, setFile, setOpenLoginForm1,setShowAbout }: HeaderProps) => {
    const auth = useAuth()
    const [loginMenuActive, setLoginMenuActive] = useState(false)
    const [isLogin, setIsLogin] = useState(false)
    const [showDropdown, setShowDropdown] = useState(true);
    const handleLogout = () => {
        auth.logout()
    }
    const handleProfileToggle = () => {

        if (auth.authenticated) {
            setLoginMenuActive(!loginMenuActive)
        }
        else setOpenLoginForm1(true)
    }
    return (
        <div>

<header className="backdrop-blur-md shadow-lg flex flex-row items-center justify-between h-14 p-4 rounded-lg bg-gray-200 text-gray-800">
                {file &&
                <Button
                    className={[
                        file ? '' : 'opacity-40 pointer-events-none',
                        'pl-1 pr-1 mx-1 sm:mx-5',
                    ].join(' ')}
                    icon={<ArrowLeftIcon className="w-6 h-6" />}
                    onClick={() => {
                        setFile(undefined)
                    }}
                >
                    <div className="md:w-[290px]">
                        <span className="hidden sm:inline select-none">
                            {m.start_new()}
                        </span>
                    </div>
                </Button>}

               {!file && <div className=" md:block text-4xl sm:flex sm:float-start font-bold text-blue-600 hover:text-blue-700 transition duration-300 ease-in-out">
                    Clearify
                </div>}

                {/* Login +Archive icons */}
                <div className="flex justify-end  w-[300px]  sm:mx-5">
                    
                   {/* { !file?.name  && <Button
                        className="hidden   md:block"
                        onClick={() => {
                            window.location.href = "#Pricing";
                        }}
                    >
                        <span>Pricing</span>


                    </Button>} */}
                    {/* <div className="hidden  md:block">
                        <Button
                            className=""
                            children={
                                <p className='  '>Archive</p>
                            }
                        >
                        </Button>
                    </div> */}
                    <Button
                        className=""
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" className="w-8  h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>}
                        onClick={() => handleProfileToggle()} children={undefined}                    >

                    </Button>



                </div>

            </header>
            {loginMenuActive   && <DropdownComponent handleLogout={handleLogout} />}

        </div>

    )
}



export default HeaderComponent