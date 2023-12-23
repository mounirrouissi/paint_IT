import { ArrowLeftIcon } from '@heroicons/react/outline'
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
        <header className="z-10 shadow flex flex-row items-center md:justify-between h-14">
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

            <div className="text-4xl font-bold text-blue-600 hover:text-blue-700 transition duration-300 ease-in-out">
                Paint IT
            </div>

            <div className="hidden md:flex justify-end w-[300px] mx-1 sm:mx-5">

                <Button
                    className="mr-5 flex"
                    icon={<ArchiveIcon className="w-6 h-6" />}
                >
                    <p>Archive</p>
                </Button>

                <Button
                    onClick={() => {
                        if (languageTag() === 'zh') {
                            setLanguageTag('en')
                        } else {
                            setLanguageTag('zh')
                        }
                    }}
                >
                    <p>{languageTag() === 'en' ? 'to chinese' : 'en'}</p>
                </Button>
            </div>
        </header>
    )
}


export default HeaderComponent