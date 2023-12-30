import { InformationCircleIcon } from '@heroicons/react/outline';
import { useState, useRef } from 'react';
import { useClickAway } from 'react-use';
import Modal from '../../Modal';
import * as m from '../../../paraglide/messages';
import { languageTag, setLanguageTag } from '../../../paraglide/runtime';
import Button from '../../Button';
import useAuth from '../../auth/AuthContext';

function FeedbackButton({showAbout,setShowAbout}:{showAbout:Boolean,setShowAbout: (showAbout:Boolean) => void} ) {
  
  const modalRef = useRef(null);
const auth=useAuth()
  useClickAway(modalRef, () => {
    setShowAbout(false);
  });
  const [feedback, setFeedback] = useState({
    type: 'like',
    details: '',
    accept: false,
  });


  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFeedback({
      ...feedback,
      [e.target.name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    auth.feedbackUser(feedback)
    // Handle form submission here
  };
  return (
    <>
    
      <Button
        className=" z-50 fixed bottom-4 right-4 lg:w-15 lg:h-12  rounded-full flex-col justify-center bg-blue-500 text-white shadow-lg   transform hover:scale-105 hover:text-black transition-transform duration-200"
        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" className="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>}
        onClick={() => {
          setShowAbout(!showAbout);
        }}
      >
        <span className=""></span> 
      </Button>
      {showAbout && (
        <Modal>
          <div ref={modalRef} className="text-xl h-full flex items-center space-y-5 bg-white p-6 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center">
                  <input type="radio" name="type" value="like" checked={feedback.type === 'like'} onChange={handleChange} />
                  <span className="ml-2">Like</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="type" value="dislike" checked={feedback.type === 'dislike'} onChange={handleChange} />
                  <span className="ml-2">Dislike</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="type" value="suggest" checked={feedback.type === 'suggest'} onChange={handleChange} />
                  <span className="ml-2">Suggest</span>
                </label>
              </div>
              <label className='font-bold mb-2 block'>Enter Feedback(*Required)</label>
              <textarea name="details" onChange={handleChange} className="w-full p-2 mb-4 border rounded" required/>
            {/*   <div className="mb-4 flex items-center">
                <input type="checkbox" name="accept" checked={feedback.accept} onChange={handleChange} />
                <label className="ml-2">
                  I accept the terms and conditions
                </label>
              </div> */}
              <div className="flex justify-end space-x-4">
                <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2">Send</button>
                <button type="button" onClick={() => setShowAbout(false)} className="bg-gray-300 text-black rounded px-4 py-2 ">Close</button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
}


export default FeedbackButton;

