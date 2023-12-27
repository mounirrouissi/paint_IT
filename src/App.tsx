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
  Route,
  Routes
} from 'react-router-dom';
import OAuth2RedirectHandler from './components/auth/oauth2/OAuth2RedirectHandler'
import useAuth, { AuthContext } from './components/auth/AuthContext'
import DropdownComponent from './components/main/header/DropdownComponent'
import { ToastContainer } from 'react-toastify';


function App() {
  const [file, setFile] = useState<File>()
  const [openLoginForm, setOpenLoginForm] = useState(false)
  const [stateLanguageTag, setStateLanguageTag] = useState<'en' | 'zh'>('en')
  const auth = useAuth()


  
  onSetLanguageTag(() => setStateLanguageTag(languageTag()))

  const [showAbout, setShowAbout] = useState(false)
  const modalRef = useRef(null)

  const [downloadProgress, setDownloadProgress] = useState(100)

  useEffect(() => {
    console.log("user ==" +auth.user)
    downloadModel('inpaint', setDownloadProgress)
  }, [])

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
  return (
   
    <div className="min-h-full flex flex-col">
 

      <HeaderComponent file={file} setFile={setFile} setOpenLoginForm1={setOpenLoginForm1}/>

    
      <main
        style={{
          height: 'calc(100vh - 56px)',
        }}
        className=" relative"
      >
        {file ? (
          <Editor file={file} />
        ) : (
          <>
            <div className="flex h-full flex-1 flex-col items-center justify-center overflow-hidden">
              <div className="h-72 sm:w-1/2 max-w-5xl">
                <FileSelect
                  onSelection={async f => {
                    const { file: resizedFile } = await resizeImageFile(
                      f,
                      1024 * 4
                    )
                    setFile(resizedFile)
                  }}
                />
              </div>
              <div className="flex flex-col sm:flex-row pt-10 items-center justify-center cursor-pointer">
                <span className="text-gray-500">{m.try_it_images()}</span>
                <div className="flex space-x-2 sm:space-x-4 px-4">
                  {['dog', 'car', 'bird'].map(
                    image => (
                      <div
                        key={image}
                        onClick={() => startWithDemoImage(image)}
                        role="button"
                        onKeyDown={() => startWithDemoImage(image)}
                        tabIndex={-1}
                      >
                        <img
                          className="rounded-md hover:opacity-75 w-auto h-25"
                          src={`examples/${image}.jpeg`}
                          alt={image}
                          style={{ height: '100px' }}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

     
      {!(downloadProgress === 100) && (
        <Modal>
          <div className="text-xl space-y-5">
            <p>{m.inpaint_model_download_message()}</p>
            <Progress percent={downloadProgress} />
          </div>
        </Modal>
      )}


    <FeedbackButton/>
    {openLoginForm && !auth.authenticated && <LoginComponent/>}
    
    </div>
   
  )
}

export default App
