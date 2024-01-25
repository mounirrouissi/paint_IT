import cv, { Mat } from 'opencv-ts';
import { ensureModel } from './cache';
import * as ort from 'onnxruntime-web';

export async function removeBackground(
    imageFile: File | HTMLImageElement,
    callback?: (progress: number) => void

    ) {
  // Load the ONNX model for background removal
  const modelBuffer = await ensureModel('removeBG');
  const session = await ort.InferenceSession.create(modelBuffer);

  // Preprocess the image (similar to imgProcess function in inpainting.ts)
  const img = imageFile instanceof HTMLImageElement
    ? imageFile
    : await loadImage(URL.createObjectURL(imageFile));
  const preprocessedImage = await processImage(img);

  // Create an ONNX tensor from the preprocessed image
  const imageTensor = new ort.Tensor('float32', preprocessedImage, [
    1, // batch size
    3, // number of channels (RGB)
    img.height,
    img.width,
  ]);

  // Run the model
  const results = await session.run({ input: imageTensor });

  // Post-process the results to create the final image
  const outputTensor = results.output; // Adjust 'output' to match your model's output name
  const postprocessedData = postProcess(outputTensor.data, img.width, img.height);

  // Convert the post-processed data to a data URL
  const imageData = new ImageData(
    new Uint8ClampedArray(postprocessedData),
    img.width,
    img.height
  );
  const dataUrl = imageDataToDataURL(imageData);

  return dataUrl;
}


function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image from ${url}`));
      img.src = url;
    });
  }
  
  function processImage(img: HTMLImageElement): Promise<Float32Array> {
    return new Promise((resolve, reject) => {
      try {
        const src = cv.imread(img);
        const srcRGB = new cv.Mat();
        cv.cvtColor(src, srcRGB, cv.COLOR_RGBA2RGB);
        const processedImage = imgProcess(srcRGB);
        resolve(processedImage);
  
        src.delete();
        srcRGB.delete();
      } catch (error) {
        reject(error);
      }
    });
  }
  
  function imgProcess(img: Mat): Float32Array {
    const channels = new cv.MatVector();
    cv.split(img, channels);
  
    const C = channels.size();
    const H = img.rows;
    const W = img.cols;
  
    const chwArray = new Float32Array(C * H * W);
  
    for (let c = 0; c < C; c++) {
      const channelData = channels.get(c).data;
      for (let h = 0; h < H; h++) {
        for (let w = 0; w < W; w++) {
          chwArray[c * H * W + h * W + w] = channelData[h * W + w] / 255.0;
        }
      }
    }
  
    channels.delete();
    return chwArray;
  }
  
  function postProcess(floatData: any , width: number, height: number): Uint8ClampedArray {
    // Assuming the model outputs a mask with values 0 for background and 1 for foreground
    const outputData = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      const val = floatData[i] > 0.5 ? 255 : 0;
      outputData[i * 4] = val;     // R
      outputData[i * 4 + 1] = val; // G
      outputData[i * 4 + 2] = val; // B
      outputData[i * 4 + 3] = val; // A
    }
    return outputData;
  }
  
  function imageDataToDataURL(imageData: ImageData): string {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx!!.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  }
// Add the loadImage, processImage, postProcess, and imageDataToDataURL functions here
// ...

// Example usage:
// removeBackground(someImageFile).then(dataUrl => {
//   // Use the dataUrl to display the image without background or save it
// });