import React, { useState } from 'react';
import FileSelect from './components/FileSelect';
import { resizeImageFile } from './utils';
import Editor from './Editor';
import Modal from './components/Modal';
import Progress from './components/Progress';
import * as m from './paraglide/messages';

interface EditorProps {
  file: File | undefined;
  setFile: (file: File | undefined) => void;
  downloadProgress: number;
  startWithDemoImage: (img: string) => Promise<void>;
}

const PlayGround: React.FC<EditorProps> = ({ file, setFile, downloadProgress, startWithDemoImage }) => {
  return (
    <>
    
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
   
   {
   !(downloadProgress === 100) && (
      <Modal>
        <div className="text-xl space-y-5">
          <p>{m.inpaint_model_download_message()}</p>
          <Progress percent={downloadProgress} />
        </div>
      </Modal>
    )}

</>
    );
};

export default PlayGround;