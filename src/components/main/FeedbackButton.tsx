import { InformationCircleIcon } from '@heroicons/react/outline';
import { useState, useRef } from 'react';
import { useClickAway } from 'react-use';
import Modal from '../Modal';
import * as m from '../../paraglide/messages';
import { languageTag, setLanguageTag } from '../../paraglide/runtime';
import Button from '../Button';

function FeedbackButton() {
  const [showAbout, setShowAbout] = useState(false);
  const modalRef = useRef(null);

  useClickAway(modalRef, () => {
    setShowAbout(false);
  });

  return (
    <>
    
      <Button
        className="hidden md:block fixed bottom-4 right-4 w-15 h-14 rounded-full justify-center bg-blue-500 text-white shadow-lg  space-x-2 transform hover:scale-105 hover:text-black transition-transform duration-200"
        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" className="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>}
        onClick={() => {
          setShowAbout(true);
        }}
      >
        <span className=""></span> 
      </Button>
      {showAbout && (
        <Modal>
          <div ref={modalRef} className="text-xl space-y-5 bg-white p-6 rounded-lg shadow-lg">
            <p>
              {' '}
              任何问题到:{' '}
              <a
                href="https://github.com/lxfater/inpaint-web"
                className="text-blue-500 underline"
                rel="noreferrer"
                target="_blank"
              >
                Inpaint-web
              </a>{' '}
              反馈
            </p>
            <p>
              {' '}
              For any questions, please go to:{' '}
              <a
                href="https://github.com/lxfater/inpaint-web"
                className="text-blue-500 underline"
                rel="noreferrer"
                target="_blank"
              >
                Inpaint-web
              </a>{' '}
              to provide feedback.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}


export default FeedbackButton;

