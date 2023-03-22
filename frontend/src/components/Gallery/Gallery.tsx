import React, {useEffect, useRef, useState} from 'react';
import Webcam from 'react-webcam';
import {nanoid} from "@reduxjs/toolkit";
import {useAppDispatch, useAppSelector} from "@/store";
import {addImage} from "@/slices/images";
import Image from "next/image";
import dynamic from "next/dynamic";

const Gallery = () => {
  const images = useAppSelector(state => state.images.list);
  return (
    <div>
      {images.map((image, index) => (
        <div key={index} className="border-b border-gray-200">
          <Image
            key={image.id}
            src={image.data}
            alt={image.prompt}
            width={120}
            height={90}
          />
        </div>
      ))}
    </div>
  );
};

export const GalleryNoSSR  = dynamic(async () => Gallery, { ssr: false });

export default Gallery;
