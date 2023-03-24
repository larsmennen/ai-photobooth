import React, {useEffect, useRef, useState} from 'react';
import {Action, nanoid} from "@reduxjs/toolkit";
import {useAppDispatch, useAppSelector} from "@/store";
import Image from "next/image";
import dynamic from "next/dynamic";
import FullscreenImageOverlay
  from "../FullscreenImageOverlay/FullscreenImageOverlay";

export type GalleryProps = {
  stateKey: string,
  removeImage: (state: any, action: Action) => Action
}

const Gallery = (props: GalleryProps) => {
  const images = useAppSelector(state => state[props.stateKey].list);
  const dispatch = useAppDispatch();

  function onClickRemove(id: string) {
    dispatch(props.removeImage(id));
  }

  return (
    <div>
      {images.map((image, index) => (
        <div key={image.id} className="card card-compact w-96 bg-base-100 shadow-xl">
          <figure>
            <FullscreenImageOverlay
              key={`img-${image.id}`}
              src={image.data}
              alt={image.prompt}
              width={1024}
              height={1024}
            />
          </figure>
          <div className="card-body">
            <p>{image.prompt}</p>
            <div className="card-actions justify-end">
              <button className="btn btn-error btn-square btn-xs" onClick={() => onClickRemove(image.id)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const GalleryNoSSR  = dynamic(async () => Gallery, { ssr: false });

export default Gallery;
