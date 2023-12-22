import React, { useState } from 'react'
import Button from './components/Button'

import {
  languageTag,
  
  setLanguageTag,
} from './paraglide/runtime'
 function FeedbackButton() {
  const [stateLanguageTag, setStateLanguageTag] = useState<'en' | 'zh'>('en')

        return <div className="hidden md:flex justify-end w-[300px] mx-1 sm:mx-5">
        <Button
          className="mr-5 flex"
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
      }
  

export default FeedbackButton