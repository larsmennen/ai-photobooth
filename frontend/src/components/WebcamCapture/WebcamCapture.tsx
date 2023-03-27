import React, {useEffect, useRef, useState} from 'react';
import Webcam from 'react-webcam';
import {nanoid} from "@reduxjs/toolkit";
import {useAppDispatch} from "@/store";
import {addImage} from "@/slices/images";
import '@tensorflow/tfjs-backend-webgl';
import * as bodyPix from '@tensorflow-models/body-pix';
import {ModelConfig} from "@tensorflow-models/body-pix/dist/body_pix_model";
import {BodyPix} from "@tensorflow-models/body-pix";

const BODYPIX_CONFIG: ModelConfig = {
  architecture: 'MobileNetV1',
  outputStride: 8,
  multiplier: 1.0, // set to smaller, e.g. 0.75 for faster model
}

const WebcamCapture = () => {
  const webcamRef = useRef<Webcam>(null);
  const [modelIsLoading, setModelIsLoading] = useState(true);
  const [bodyPixNet, setBodyPixNet] = useState<BodyPix | undefined>(undefined);
  const dispatch = useAppDispatch();
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const loadModel = async () => {
    setModelIsLoading(true);
    const model = await bodyPix.load(BODYPIX_CONFIG);
    setBodyPixNet(model);
    setModelIsLoading(false)
  }
  useEffect( () => {
    loadModel()
  }, []);

  useEffect(() => {
    const getDevices = async () => {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      setSelectedDeviceId(videoDevices[0].deviceId);
    };
    getDevices();
  }, []);

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {

      // Transform to ImageData object
      const image = new Image();
      image.src = imageSrc;
      image.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const context = canvas.getContext('2d');
        if (!context) return;
        context.drawImage(image, 0, 0);

        const imageData = context.getImageData(0, 0, image.width, image.height);

        // Segment image
        if (!bodyPixNet) {
          alert('bodyPixNet not loaded');
          return;
        }
        const mask = await bodyPixNet.segmentPerson(imageData);

        // Combine images according to the mask
        for (let y = 0; y < mask.height; y++) {
          for (let x = 0; x < mask.width; x++) {
            const maskIndex = (y * mask.width + x); // mask is 1 channel
            const imgIndex = maskIndex * 4;
            if (mask.data[maskIndex] === 1) {
              imageData.data[imgIndex] = imageData.data[imgIndex];
              imageData.data[imgIndex + 1] = imageData.data[imgIndex + 1];
              imageData.data[imgIndex + 2] = imageData.data[imgIndex + 2];
              imageData.data[imgIndex + 3] = imageData.data[imgIndex + 3];
            } else {
              // imageData.data[imgIndex] = background.data[imgIndex];
              // imageData.data[imgIndex + 1] = background.data[imgIndex + 1];
              // imageData.data[imgIndex + 2] = background.data[imgIndex + 2];
              // imageData.data[imgIndex + 3] = background.data[imgIndex + 3];
              imageData.data[imgIndex] = 0;
              imageData.data[imgIndex + 1] = 0;
              imageData.data[imgIndex + 2] = 0;
              imageData.data[imgIndex + 3] = 1;
            }
          }
        }

        context.putImageData(imageData, 0, 0)
        const dataURL = canvas.toDataURL();

        // Store
        const id = nanoid();
        dispatch(addImage({id, data: dataURL, prompt: ''}));
      }


    }
  };

  const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeviceId(event.target.value);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="relative">
        <Webcam
          audio={false}
          ref={webcamRef}
          videoConstraints={{ deviceId: selectedDeviceId }}
          screenshotFormat="image/jpeg"
          className="rounded-lg shadow-lg"
        />
        <div className="absolute top-0 right-0 m-4">
          <label htmlFor="webcam-select" className="sr-only">
            Select a webcam
          </label>
          <select
            id="webcam-select"
            className="select select-bordered py-2 px-4 bg-white rounded-lg shadow-md"
            value={selectedDeviceId}
            onChange={handleDeviceChange}
          >
            {devices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {modelIsLoading ? (
        <button  className="btn btn-loading mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg">
          Loading
        </button>
      ): (
        <button onClick={capture} className="btn mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg">
          Capture
        </button>
      )}
    </div>
  );
};

export default WebcamCapture;
