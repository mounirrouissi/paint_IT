/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/outline'
import { useContext, useEffect, useRef, useState } from 'react'
import { useClickAway } from 'react-use'
import Button from './components/Button'
import FileSelect from './components/FileSelect'
import Modal from './components/Modal'
import Editor from './Editor'
import { resizeImageFile } from './utils'
import Progress from './components/Progress'
import { downloadModel } from './adapters/cache'
import * as m from './paraglide/messages'
import {
  languageTag,
  onSetLanguageTag,
  setLanguageTag,
} from './paraglide/runtime'
import FeedbackButton from './components/main'
import HeaderComponent from './components/main/header/HeaderComponent'
import LoginComponent from './components/auth/LoginComponent'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from 'react-router-dom';

import { PurchaseRequest } from './types/types';
import OAuth2RedirectHandler from './components/auth/oauth2/OAuth2RedirectHandler'
import useAuth, { AuthContext } from './components/auth/AuthContext'
import DropdownComponent from './components/main/header/DropdownComponent'
import { ToastContainer } from 'react-toastify';
import PlayGround from './PlayGround'
import { purchase } from './util/APIUtils'


function App() {
  const [file, setFile] = useState<File>()
  const [openLoginForm, setOpenLoginForm] = useState(false)
  const [showAbout, setShowAbout] = useState(false);
  const [isBottom, setIsBottom] = useState(false);
  const [stateLanguageTag, setStateLanguageTag] = useState<'en' | 'zh'>('en')
  const auth = useAuth()


  
  onSetLanguageTag(() => setStateLanguageTag(languageTag()))

  const modalRef = useRef(null)

  const [downloadProgress, setDownloadProgress] = useState(100)

  useEffect(() => {
    auth.loadCurrentlyLoggedInUser()
    console.log("user ==" +auth.user)
    downloadModel('inpaint', setDownloadProgress)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      // Check if user has scrolled more than 50px
      const isScrolled = window.scrollY > 50;
      setIsBottom(isScrolled);
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useClickAway(modalRef, () => {
    setShowAbout(false)
  })

  async function startWithDemoImage(img: string) {
    const imgBlob = await fetch(`/examples/${img}.jpeg`).then(r => r.blob())
    setFile(new File([imgBlob], `${img}.jpeg`, { type: 'image/jpeg' }))
  }

  const setOpenLoginForm1=() => {
    setOpenLoginForm(!openLoginForm)  
  }
  async function handlePurchase(index: number): Promise<void> {
    if (!auth.authenticated) {
       alert('Please login first');
    } else {
       const purchaseRequest: PurchaseRequest = {index: index, customerEmail: auth.user.email, customerName: auth.user.name};
       try {
           const response = await purchase(purchaseRequest);
          
               if (response.status === 'success') {
                   // Redirect the user to the Stripe checkout page
                   window.location.href = response.url;
               } else {
                   console.error('Purchase failed:', response.message);
               }
       } catch (error) {
           console.error('Error during purchase:', error);
       }
    }
   }

 
 console.log("APP.tsx img="+file)
  return (
   
    <div className="min-h-full flex flex-col ">
 

      <HeaderComponent file={file} setFile={setFile} setOpenLoginForm1={setOpenLoginForm1} setShowAbout={() => setShowAbout(!showAbout)}/>

    
      <PlayGround file={file} setFile={setFile} downloadProgress={downloadProgress} startWithDemoImage={startWithDemoImage} />


{/* 
   { !file &&  <FeedbackButton showAbout={showAbout} setShowAbout={setShowAbout}/>}
    {openLoginForm && !auth.authenticated && <LoginComponent/>} */}
    
{/* 
{  !file?.name  && !showAbout && <div id='Pricing'  className="flex flex-col items-center justify-center min-h-screen mt-7  bg-gray-100">
      <h1 className="text-4xl font-bold mb-10">Pricing</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {['UI Design', 'PRO monthly','PRO Yearly'].map((title, index) => (
          <div key={index} className={`bg-white rounded-lg shadow-md p-6 transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-80 ${index === 1 ? 'border-4 border-second ' : index === 2 ? 'border-4 border-blue-600 ' : ''}`}>
            <div className="flex justify-center items-center mb-4">
              <span className={`material-icons text-4xl text-gray-500 ${index === 0 ? 'text-2xl' : index === 1 ? 'text-4xl' : 'text-5xl'}`}>
                {index === 0 ? 'Public Version'  : index === 1 ? 'Most Used' : 'Best Offer'}
              </span>
            </div>
            <h1 className={`text-2xl font-bold mb-4 text-center ${index === 1 ? 'underline' : ''} ${index === 2 ? 'underline text-blue-500' : ''}`}>{title}</h1>
            <hr className="mb-4"/>
            <p className="text-gray-600 mb-4">
              Lorem ipsum dolor   sit amet, consectetur adipisicing elit. Sapiente harum voluptatum, sit cum voluptatibus inventore quae qui provident eveniet dicta at, quibusdam ipsam iusto reprehenderit hic saepe nesciunt sed illo.
              </p>
            <ul>
  <li><strong>Effortless Object Removal</strong>: Easily remove unwanted objects or elements from your images with just a few taps, enhancing the overall aesthetics of your photos.</li>
  <li><strong>Advanced Image Autoscaling</strong>: Seamlessly upscale your images up to 4 times their original size without compromising quality, allowing for greater detail and clarity.</li>
</ul>

          
            <hr className="mb-4"/>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">
                <span>{index === 0 ? 'FREE FOREVER' : index === 1 ? '5' : '30' }</span>
                {index !== 0 && <b className="text-sm">$</b>}
              </div>
              {(index === 1 || index === 2) && <a href="#" className="px-4 py-2 bg-yellow-400  text-white rounded hover:bg-yellow-600 transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110" onClick={()=>handlePurchase(index)}>Purchase now</a>}
            </div>
          </div>
        ))}
      </div>
    </div>} */}


    </div>
   
  )
}

export default App