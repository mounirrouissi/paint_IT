/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import { DownloadIcon, EyeIcon, ViewBoardsIcon, ZoomInIcon } from '@heroicons/react/outline'
import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { useWindowSize } from 'react-use'
import inpaint from './adapters/inpainting'
import superResolution from './adapters/superResolution'
import Button from './components/Button'
import Slider from './components/Slider'
import { downloadImage, isSmallScreen, loadImage, useImage } from './utils'
import Progress from './components/Progress'
import { modelExists, downloadModel } from './adapters/cache'
import Modal from './components/Modal'
import * as m from './paraglide/messages'
import { EditorProps } from './types/types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShuttleSpace } from '@fortawesome/free-solid-svg-icons';
import { removeBackground } from './adapters/removeBg'

interface Line {
  size?: number
  pts: { x: number; y: number }[]
  src: string
}

function drawLines(
  ctx: CanvasRenderingContext2D,
  lines: Line[],
  color = 'rgba(255, 0, 0, 0.5)'
) {
  ctx.strokeStyle = color
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  lines.forEach(line => {
    if (!line?.pts.length || !line.size) {
      return
    }
    ctx.lineWidth = line.size
    ctx.beginPath()
    ctx.moveTo(line.pts[0].x, line.pts[0].y)
    line.pts.forEach(pt => ctx.lineTo(pt.x, pt.y))
    ctx.stroke()
  })
}

const BRUSH_HIDE_ON_SLIDER_CHANGE_TIMEOUT = 2000

export default function Editor(props: EditorProps) {
  const { file } = props
  const [brushSize, setBrushSize] = useState(40)
  const [original, isOriginalLoaded] = useImage(file ?? new Blob())
 const [renders, setRenders] = useState<HTMLImageElement[]>([])
  const [showSlider, setShowSlider] = useState(false)
  const [isZoomActive, setZoomActive] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1);

  const [context, setContext] = useState<CanvasRenderingContext2D>()
  const [maskCanvas] = useState<HTMLCanvasElement>(() => {
    return document.createElement('canvas')
  })
  const [lines, setLines] = useState<Line[]>([{ pts: [], src: '' }])
  const brushRef = useRef<HTMLDivElement>(null)
  const [showBrush, setShowBrush] = useState(false)
  const [hideBrushTimeout, setHideBrushTimeout] = useState(0)
  const [showOriginal, setShowOriginal] = useState(false)
  const [isInpaintingLoading, setIsProcessingLoading] = useState(false)
  const [generateProgress, setGenerateProgress] = useState(0)
  const modalRef = useRef(null)
  const [separator, setSeparator] = useState<HTMLDivElement>()
  const [useSeparator, setUseSeparator] = useState(false)
  const [originalImg, setOriginalImg] = useState<HTMLDivElement>()
  const [separatorLeft, setSeparatorLeft] = useState(0)
  const historyListRef = useRef<HTMLDivElement>(null)
  const isBrushSizeChange = useRef<boolean>(false)
  const scaledBrushSize = useMemo(() => brushSize, [brushSize])
  const canvasDiv = useRef<HTMLDivElement>(null)
  const [downloaded, setDownloaded] = useState(true)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [upscaleNumber, setUpscaleNumber] = useState(1)

  const windowSize = useWindowSize()

  const draw = useCallback(
    (index = -1) => {
      if (!context) {
        return
      }
      context.clearRect(0, 0, context.canvas.width, context.canvas.height)
      const currRender =
        renders[index === -1 ? renders.length - 1 : index] ?? original
      const { canvas } = context

      const divWidth = canvasDiv.current!.offsetWidth
      const divHeight = canvasDiv.current!.offsetHeight

      // 计算宽高比
      const imgAspectRatio = currRender.width / currRender.height
      const divAspectRatio = divWidth / divHeight

      let canvasWidth
      let canvasHeight

      // 比较宽高比以决定如何缩放
      if (divAspectRatio > imgAspectRatio) {
        // div 较宽，基于高度缩放
        canvasHeight = divHeight
        canvasWidth = currRender.width * (divHeight / currRender.height)
      } else {
        // div 较窄，基于宽度缩放
        canvasWidth = divWidth
        canvasHeight = currRender.height * (divWidth / currRender.width)
      }

      canvas.width = canvasWidth
      canvas.height = canvasHeight

      if (currRender?.src) {
        context.drawImage(currRender, 0, 0, canvas.width, canvas.height)
      } else {
        context.drawImage(original, 0, 0, canvas.width, canvas.height)
      }
      const currentLine = lines[lines.length - 1]
      drawLines(context, [currentLine])
    },
    [context, lines, original, renders]
  )

  const refreshCanvasMask = useCallback(() => {
    if (!context?.canvas.width || !context?.canvas.height) {
      throw new Error('canvas has invalid size')
    }
    maskCanvas.width = context?.canvas.width
    maskCanvas.height = context?.canvas.height
    const ctx = maskCanvas.getContext('2d')
    if (!ctx) {
      throw new Error('could not retrieve mask canvas')
    }
    // Just need the finishing touch
    const line = lines.slice(-1)[0]
    if (line) drawLines(ctx, [line], 'white')
  }, [context?.canvas.height, context?.canvas.width, lines, maskCanvas])

  // Draw once the original image is loaded
  useEffect(() => {

    if (!context?.canvas) {
      return
    }
    if (isOriginalLoaded) {
      draw()
    }
  }, [context?.canvas, draw, original, isOriginalLoaded, windowSize])

  // Handle mouse interactions
  useEffect(() => {
    const canvas = context?.canvas
    if (!canvas) {
      return
    }
    const onMouseMove = (ev: MouseEvent) => {
      if (brushRef.current) {
        const x = ev.pageX - scaledBrushSize / 2
        const y = ev.pageY - scaledBrushSize / 2

        brushRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }
    }
    const onPaint = (px: number, py: number) => {
      const currLine = lines[lines.length - 1]
      currLine.pts.push({ x: px, y: py })
      draw()
    }
    const onMouseDrag = (ev: MouseEvent) => {
      const px = ev.offsetX - canvas.offsetLeft
      const py = ev.offsetY - canvas.offsetTop
      onPaint(px, py)
    }

    const onPointerUp = async () => {
      if (!original.src || showOriginal) {
        return
      }
      if (lines.slice(-1)[0]?.pts.length === 0) {
        return
      }
      const loading = onloading()
      canvas.removeEventListener('mousemove', onMouseDrag)
      canvas.removeEventListener('mouseup', onPointerUp)
      refreshCanvasMask()
      try {
        const start = Date.now()
        console.log('inpaint_start')
        // each time based on the last result, the first is the original
        const newFile = renders.slice(-1)[0] ?? file
        const res = await inpaint(newFile, maskCanvas.toDataURL())
        if (!res) {
          throw new Error('empty response')
        }
        // TODO: fix the render if it failed loading
        const newRender = new Image()
        newRender.dataset.id = Date.now().toString()
        await loadImage(newRender, res)
        renders.push(newRender)
        lines.push({ pts: [], src: '' } as Line)
        setRenders([...renders])
        setLines([...lines])
        console.log('inpaint_processed', {
          duration: Date.now() - start,
        })
      } catch (e: any) {
        console.log('inpaint_failed', {
          error: e,
        })
        // eslint-disable-next-line
        alert(e.message ? e.message : e.toString())
      }
      if (historyListRef.current) {
        const { scrollWidth, clientWidth } = historyListRef.current
        if (scrollWidth > clientWidth) {
          historyListRef.current.scrollTo(scrollWidth, 0)
        }
      }
      loading.close()
      draw()
    }
    canvas.addEventListener('mousemove', onMouseMove)

    const onTouchMove = (ev: TouchEvent) => {
      ev.preventDefault()
      ev.stopPropagation()
      const currLine = lines[lines.length - 1]
      const coords = canvas.getBoundingClientRect()
      currLine.pts.push({
        x: ev.touches[0].clientX - coords.x,
        y: ev.touches[0].clientY - coords.y,
      })
      draw()
    }
    const onPointerStart = () => {
      if (!original.src || showOriginal) {
        return
      }
      const currLine = lines[lines.length - 1]
      currLine.size = brushSize
      canvas.addEventListener('mousemove', onMouseDrag)
      canvas.addEventListener('mouseup', onPointerUp)
      // onPaint(e)
    }

    canvas.addEventListener('touchstart', onPointerStart)
    canvas.addEventListener('touchmove', onTouchMove)
    canvas.addEventListener('touchend', onPointerUp)
    canvas.onmouseenter = () => {
      window.clearTimeout(hideBrushTimeout)
      setShowBrush(true && !showOriginal)
    }
    canvas.onmouseleave = () => setShowBrush(false)
    canvas.onmousedown = onPointerStart

    return () => {
      canvas.removeEventListener('mousemove', onMouseDrag)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseup', onPointerUp)
      canvas.removeEventListener('touchstart', onPointerStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onPointerUp)
      canvas.onmouseenter = null
      canvas.onmouseleave = null
      canvas.onmousedown = null
    }
  }, [
    brushSize,
    context,
    file,
    draw,
    lines,
    refreshCanvasMask,
    maskCanvas,
    original.src,
    renders,
    showOriginal,
    hideBrushTimeout,
  ])

  useEffect(() => {
    if (!separator || !originalImg) return

    const separatorMove = (ev: MouseEvent) => {
      ev.preventDefault()
      ev.stopPropagation()
      if (context?.canvas) {
        const { width } = context?.canvas
        const canvasRect = context?.canvas.getBoundingClientRect()
        const separatorOffsetLeft = ev.pageX - canvasRect.left
        if (separatorOffsetLeft <= width && separatorOffsetLeft >= 0) {
          setSeparatorLeft(separatorOffsetLeft)
        } else if (separatorOffsetLeft < 0) {
          setSeparatorLeft(0)
        } else if (separatorOffsetLeft > width) {
          setSeparatorLeft(width)
        }
      }
    }

    const separatorDown = () => {
      window.addEventListener('mousemove', separatorMove)
      setUseSeparator(true)
    }

    const separatorUp = () => {
      window.removeEventListener('mousemove', separatorMove)
      setUseSeparator(false)
    }

    separator.addEventListener('mousedown', separatorDown)
    window.addEventListener('mouseup', separatorUp)

    return () => {
      separator.removeEventListener('mousedown', separatorDown)
      window.removeEventListener('mouseup', separatorUp)
    }
  }, [separator, context])

  function download() {
    const currRender = renders.at(-1) ?? original
    downloadImage(currRender.currentSrc, 'IMG')
  }

  const undo = useCallback(async () => {
    const l = lines
    l.pop()
    l.pop()
    setLines([...l, { pts: [], src: '' }])
    const r = renders
    r.pop()
    setRenders([...r])
  }, [lines, renders])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!renders.length) {
        return
      }
      const isCmdZ = (event.metaKey || event.ctrlKey) && event.key === 'z'
      if (isCmdZ) {
        event.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [renders, undo])

  const backTo = useCallback(
    (index: number) => {
      lines.splice(index + 1)
      setLines([...lines, { pts: [], src: '' }])
      renders.splice(index + 1)
      setRenders([...renders])
    },
    [renders, lines]
  )

  const History = useMemo(
    () =>
      renders.map((render, index) => {
        return (
          <div
            key={render.dataset.id}
            style={{
              position: 'relative',
              display: 'inline-block',
              flexShrink: 0,
            }}
          >
            <img
              src={render.src}
              alt="render"
              className="rounded-sm"
              style={{
                height: '90px',
              }}
            />
            <Button
              className="hover:opacity-100 opacity-0 cursor-pointer rounded-sm"
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => backTo(index)}
              onEnter={() => draw(index)}
              onLeave={draw}
            >
              <div
                style={{
                  color: '#fff',
                  fontSize: '12px',
                  textAlign: 'center',
                }}
              >
                Back here
              </div>
            </Button>
          </div>
        )
      }),
    [renders, backTo]
  )

  const handleSliderStart = () => {
    setShowBrush(true)
  }
  const handleSliderChange = (sliderValue: number) => {
    if (!isBrushSizeChange.current) {
      isBrushSizeChange.current = true
    }
    if (brushRef.current) {
      const x = document.documentElement.clientWidth / 2 - scaledBrushSize / 2
      const y = document.documentElement.clientHeight / 2 - scaledBrushSize / 2

      brushRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }
    setBrushSize(sliderValue)
    window.clearTimeout(hideBrushTimeout)
    setHideBrushTimeout(
      window.setTimeout(() => {
        setShowBrush(false)
      }, BRUSH_HIDE_ON_SLIDER_CHANGE_TIMEOUT)
    )
  }

  const onloading = useCallback(() => {
    setIsProcessingLoading(true)
    setGenerateProgress(0)
    const progressTimer = window.setInterval(() => {
      setGenerateProgress(p => {
        if (p < 90) return p + 10 * Math.random()
        if (p >= 90 && p < 99) return p + 1 * Math.random()
        // Do not hide the progress bar after 99%,cause sometimes long time progress
        // window.setTimeout(() => setIsInpaintingLoading(false), 500)
        return p
      })
    }, 1000)
    return {
      close: () => {
        clearInterval(progressTimer)
        setGenerateProgress(100)
        setIsProcessingLoading(false)
      },
    }
  }, [])


  function imageToBlob(image: HTMLImageElement | File | undefined): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!image) {
        reject(new Error('Image is undefined'));
        return;
      }
  
      const canvas = document.createElement('canvas');
      let ctx: CanvasRenderingContext2D | null;
  
      if (image instanceof HTMLImageElement) {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(image, 0, 0);
        canvas.toBlob(blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not convert image to Blob'));
          }
        }, 'image/png');
      } else if (image instanceof File) {
        // Create an object URL for the file
        const objectURL = URL.createObjectURL(image);
        const img = new Image();
        img.onload = () => {
          // Once the image is loaded, get its dimensions
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            URL.revokeObjectURL(objectURL); // Clean up the object URL
            return;
          }
          // Draw the image onto the canvas
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(blob => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Could not convert image to Blob'));
            }
            URL.revokeObjectURL(objectURL); // Clean up the object URL
          }, 'image/png');
        };
        img.onerror = () => {
          reject(new Error('Could not load image from File'));
          URL.revokeObjectURL(objectURL); // Clean up the object URL
        };
        // Set the src of the image to the object URL to start loading
        img.src = objectURL;
      } else {
        reject(new Error('Invalid image type'));
      }
    });
  }

 const removeBG = async () => {
  console.log("removing background");
  const newFile = renders.at(-1) ?? file;
  const formData = new FormData();
  const newBlobFile = await imageToBlob(newFile);
  formData.append('image', newBlobFile);

  const response = await fetch('http://127.0.0.1:8000/api/process_image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }


  const start = Date.now()

  // Create a new HTMLImageElement and set its src to the object URL
  const newRender = new Image();
 

  const imageStr = await response.text(); // Get the base64 string from the response

  // downloadImage(`data:image/png;base64,${imageStr}`, 'IMG');
  const src = `data:image/png;base64,${imageStr}`;
 
  newRender.dataset.id = Date.now().toString()
  await loadImage(newRender, src)
  renders.push(newRender)
  lines.push({ pts: [], src: '' } as Line)
  setRenders([...renders])
  setLines([...lines])
  console.log('superResolution_processed', {
    duration: Date.now() - start,
  })
   
};

  

const onSuperResolution = useCallback(async () => {
    setUpscaleNumber(2)
    if (!(await modelExists('superResolution'))) {
      setDownloaded(false)
      await downloadModel('superResolution', setDownloadProgress)
      setDownloaded(true)
    }
    setIsProcessingLoading(true)
    try {
      // 运行
      const start = Date.now()
      console.log('superResolution_start')
      // each time based on the last result, the first is the original
      const newFile = renders.at(-1) ?? file;
      if (!newFile) {
        throw new Error('No file to process for super resolution.');
      }
      const res = await superResolution(newFile, setGenerateProgress);
      if (!res) {
        throw new Error('empty response')
      }
      // TODO: fix the render if it failed loading
      const newRender = new Image()
      newRender.dataset.id = Date.now().toString()
      await loadImage(newRender, res)
      renders.push(newRender)
      lines.push({ pts: [], src: '' } as Line)
      setRenders([...renders])
      setLines([...lines])
      console.log('superResolution_processed', {
        duration: Date.now() - start,
      })

    } catch (error) {
      console.error('superResolution', error)
    } finally {
      setIsProcessingLoading(false)
    }
  }, [file, lines, original.naturalHeight, original.naturalWidth, renders])

  const handleZoomClick = () => {
    setZoomActive(!isZoomActive)
    setZoomLevel(prev => prev + 0.1);
  }
  console.log("Editor.tsx img="+file?.name)

  return (
    <div
      className={[
        'flex flex-col h-4/5    justify-between overflow-y-hidden ',
        isInpaintingLoading ? 'animate-pulse-fast pointer-events-none' : '',
      ].join(' ')}
    >
     
    <div className="grid w-full sm:w-screen  sm:grid-rows-4  h-screen   lg:grid-cols-5 lg:justify-center   overflow-hidden"   >
      
     
       {/* canva */}

         <div
           className={[
            'Canva',
            'row-span-3  sm:w-screen lg:order-2 lg:col-span-4 lg:row-span-3 flex items-center justify-center lg:justify-normal lg:ml-40 ',
            'mt-1',
            '',
           ].join(' ')}
           style={{
         
         
          }}
           ref={canvasDiv}
         >
           <div className="relative">
             <canvas
               className="rounded-sm"
               style={showBrush ? { cursor: 'none' } : {}}
               ref={r => {
                 if (r && !context) {
                   const ctx = r.getContext('2d')
                   if (ctx) {
                     setContext(ctx)
                   }
                 }
               }}
             />
             <div
               className={[
                 'absolute top-0 right-0 pointer-events-none',
                 showOriginal ? '' : 'overflow-hidden',
               ].join(' ')}
               style={{
                 width: showOriginal ? `${context?.canvas.width}px` : '0px',
                 height: context?.canvas.height,
                 transitionProperty: 'width, height',
                 transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                 transitionDuration: '300ms',
               }}
               ref={r => {
                 if (r && !originalImg) {
                   setOriginalImg(r)
                 }
               }}
             >
               <div
                 className={[
                   'absolute top-0 right-0 pointer-events-none z-10',
                   useSeparator ? 'bg-black text-white' : 'bg-primary ',
                   'w-1',
                   'flex items-center justify-center',
                   'separator',
                 ].join(' ')}
                 style={{
                   left: `${separatorLeft}px`,
                   height: context?.canvas.height,
                   transitionProperty: 'width, height',
                   transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                   transitionDuration: '300ms',
                 }}
               >
                 <span className="absolute left-1 bottom-0 p-1 bg-opacity-25 bg-black rounded text-white select-none">
                   original
                 </span>
                 <div
                   className={[
                     'absolute py-2 px-1 rounded-md pointer-events-auto',
                     useSeparator ? 'bg-black' : 'bg-primary ',
                   ].join(' ')}
                   style={{ cursor: 'ew-resize' }}
                   ref={r => {
                     if (r && !separator) {
                       setSeparator(r)
                     }
                   }}
                 >
                   <ViewBoardsIcon
                     className="w-5 h-5"
                     style={{ cursor: 'ew-resize' }}
                   />
                 </div>
               </div>
               <img
                 className="absolute right-0"
                 src={original.src}
                 alt="original"
                 width={`${context?.canvas.width}px`}
                 height={`${context?.canvas.height}px`}
                 style={{
                   width: `${context?.canvas.width}px`,
                   height: `${context?.canvas.height}px`,
                   maxWidth: 'none',
                   clipPath: `inset(0 0 0 ${separatorLeft}px)`,
                 }}
               />
             </div>
           {  isInpaintingLoading &&( <div className="z-10 bg-white absolute bg-opacity-80 top-0 left-0 right-0 bottom-0  h-full w-full flex justify-center items-center">
                 <div ref={modalRef} className="text-xl space-y-5 w-4/5 sm:w-1/2">
                   {/* <p>正在处理中，请耐心等待。。。</p> */}
                   
                   <p>It is being processed, please wait...</p><FontAwesomeIcon icon={faShuttleSpace} beatFade className="w-8 h-8" />
                   <Progress percent={generateProgress} />
                 </div>
               </div>
             )}
           </div>
         </div>

       {/* History */}
      
       <div className="row-span-2 lg:row-span-3 w-full h-full  lg:h-full   lg:col-span-1    ">
         <div
           ref={historyListRef}
           style={{ position: 'relative' }}
           className={[
            'History lg:order-1 mr-2 ',
            'lg:mt-4 mt-1 border lg:p-2 rounded',
            'lg:w-full h-full   lg:p-2',
            'space-y-0 ml-2',
            'scrollbar-thin scrollbar-thumb-slate-400 overflow-y-scroll overflow-x-scroll',
            'flex sm:flex-col items-center w-full gap-8' // Add these classes
           ].join(' ')}
         >
           {History}

           {/* archive photoes button */}
        {/*    <button
         
         style={{
           position: 'absolute',
           bottom: '10px',
           right: '0',
           backgroundColor: 'red', // Change this to the color you want
           border: 'none',
           borderRadius: '50%',
           width: '50px',
           height: '50px',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
         }}
       >
        
         <svg height="24" width="24">
           <circle cx="12" cy="12" r="10" stroke="black" stroke-width="1" fill="white" />
         </svg>
         </button> */}
             {!downloaded && (
        <Modal>
          <div className="text-xl space-y-5">
            <p>{m.upscaleing_model_download_message()}</p>
            <Progress percent={downloadProgress} />
          </div>
        </Modal>
      )}
      {showBrush && (
        <div
          className="fixed rounded-full bg-red-500 bg-opacity-50 pointer-events-none left-0 top-0"
          style={{
            width: `${scaledBrushSize}px`,
            height: `${scaledBrushSize}px`,
            transform: `translate3d(-100px, -100px, 0)`,
          }}
          ref={brushRef}
        />
      )} </div>
         
       
       
       </div>
  
    </div>

  
      
      {/* Bottom sheet*/}
      <div
        className={[
          'bottom_sheet   fixed  bottom-1  ',
          'bg-transparent  rounded-md border border-gray-300 hover:border-gray-400 shadow-md hover:shadow-lg p-0 lg:p-2  transition duration-200 ease-in-out',
          'flex items-center w-full self-center  max-w-4xl lg:py-6 mb-2  lg:mb-4 justify-between',
          'lg:space-y-2  sm:flex-row sm:space-x-5', 
        ].join(' ')}
      >
        {renders.length > 0 && (
          <Button
            primary
            onClick={undo}
            icon={
              <svg
                className="w-6 h-6"
                width="19"
                height="9"
                viewBox="0 0 19 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 1C2 0.447715 1.55228 0 1 0C0.447715 0 0 0.447715 0 1H2ZM1 8H0V9H1V8ZM8 9C8.55228 9 9 8.55229 9 8C9 7.44771 8.55228 7 8 7V9ZM16.5963 7.42809C16.8327 7.92721 17.429 8.14016 17.9281 7.90374C18.4272 7.66731 18.6402 7.07103 18.4037 6.57191L16.5963 7.42809ZM16.9468 5.83205L17.8505 5.40396L16.9468 5.83205ZM0 1V8H2V1H0ZM1 9H8V7H1V9ZM1.66896 8.74329L6.66896 4.24329L5.33104 2.75671L0.331035 7.25671L1.66896 8.74329ZM16.043 6.26014L16.5963 7.42809L18.4037 6.57191L17.8505 5.40396L16.043 6.26014ZM6.65079 4.25926C9.67554 1.66661 14.3376 2.65979 16.043 6.26014L17.8505 5.40396C15.5805 0.61182 9.37523 -0.710131 5.34921 2.74074L6.65079 4.25926Z"
                  fill="currentColor"
                />
              </svg>
            }
          >
            <span className='hidden md:block'>{m.undo()}</span>
          </Button>
        )}
       
      <div className="block sm:hidden">
        
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            onClick={() => setShowSlider(!showSlider)}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
            />
          </svg>
      </div>
      <div className="hidden md:block">
          <Slider
            label={m.bruch_size()}
            min={10}
            max={200}
            value={brushSize}
            onChange={handleSliderChange}
            onStart={handleSliderStart}
          />
        </div>

        {showSlider && (
          <Slider
            label={m.bruch_size()}
            min={10}
            max={200}
            value={brushSize}
            onChange={handleSliderChange}
            onStart={handleSliderStart}
          />
        )}
{/* 
<Button
          className='flex flex-col '
        title="See original"
          primary={isZoomActive}
          icon={<ZoomInIcon className="w-10 h-7 self-center  " />}
          onClick={()=>handleZoomClick()} 
        >
           {<span className="text-xs">{m.original()}</span>  }
        </Button> */}

        <Button
        className='flex  items-center ' 
        title="See original"
          primary={showOriginal}
          icon={<EyeIcon className="w-10 h-7 self-center  " />}
          onUp={() => {
            setShowOriginal(!showOriginal)
            setTimeout(() => setSeparatorLeft(0), 300)
          }}
        >
           <span className="hidden md:block text-lg">{m.original()}</span> 
        </Button>
        {!showOriginal && (
         <Button 
         className={`flex  items-center ${upscaleNumber !=1? 'opacity-50 cursor-not-allowed ':''}  disabled:${upscaleNumber >1}` }

         onUp={upscaleNumber === 1 ? onSuperResolution : undefined}
         icon={
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
           </svg>
         }
       >
         <span className="hidden md:block text-lg">{m.upscale()}</span>
       </Button>
        )}

{!showOriginal && (
         <Button 
         className='bg-transparent'
         primary
         icon={
           <svg
             xmlns="http://www.w3.org/2000/svg"
             className="h-6 w-6"
             fill="none"
             viewBox="0 0 24 24"
             stroke="currentColor"
             strokeWidth={2}
           >
             <path
               strokeLinecap="round"
               strokeLinejoin="round"
               d="M17.25 6.75l-1.5 1.5-2.5-2.5 1.5-1.5a2.121 2.121 0 013 3zm-3 3l-9 9H3v-2.25l9-9 2.25 2.25zm3 0l2.25-2.25 2.5 2.5H18v1.5l-2.25 2.25L13.5 12z"
             />
           </svg>
         }
         onClick={removeBG}
       >
    

   <span className='hidden md:block'>remove BG</span>
          </Button>
          )}


        {isSmallScreen() ? (
          <div className="fixed top-10 right-0 p-2 ">
            <Button
            className='bg-transparent'
              primary
              icon={<DownloadIcon className="w-6 h-6" />}
              onClick={download}
            >
              <span className='hidden md:block'>{m.download()}</span>
            </Button>
          </div>
        ) : (
          <Button
            primary
            icon={<DownloadIcon className="w-6 h-6" />}
            onClick={download}
          >
            <span className='hidden md:block'>{m.download()}</span>
          </Button>
        )}
     
   

     

      </div>
    </div>
  )
}