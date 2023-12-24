import { ArrowLeftIcon, LoginIcon, LogoutIcon } from '@heroicons/react/outline'
import { useState } from 'react'
import Button from '../Button'
import { languageTag, setLanguageTag } from '../../paraglide/runtime'
import * as m from '../../paraglide/messages'
import { ArchiveIcon } from '@heroicons/react/outline'

interface HeaderProps {
  file: File | undefined;
  setFile: (file: File | undefined) => void;
}

const HeaderComponent = ({ file, setFile }: HeaderProps) => {
    return (
        <header className="z-10 shadow flex flex-row items-center justify-between h-14">
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
            </Button>

            <div className="hidden md:block text-4xl font-bold text-blue-600 hover:text-blue-700 transition duration-300 ease-in-out">
                Paint IT
            </div>

            <div className="flex justify-end  w-[300px]  sm:mx-5">

                <Button
                    className="mr-5 "
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>}
                >
                    <p className='hidden md:block'>Archive</p>
                </Button>

           {/*      <Button
                className='hidden md:block'
                    onClick={() => {
                        if (languageTag() === 'zh') {
                            setLanguageTag('en')
                        } else {
                            setLanguageTag('zh')
                        }
                    }}
                >
                    <p>{languageTag() === 'en' ? 'to chinese' : 'en'}</p>
                </Button> */}
            </div>
        </header>
    )
}


export default HeaderComponent