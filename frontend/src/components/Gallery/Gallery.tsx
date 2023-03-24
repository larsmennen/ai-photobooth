import React, {useEffect, useRef, useState} from 'react';
import {Action, nanoid} from "@reduxjs/toolkit";
import {useAppDispatch, useAppSelector} from "@/store";
import Image from "next/image";
import dynamic from "next/dynamic";
import FullscreenImageOverlay
  from "../FullscreenImageOverlay/FullscreenImageOverlay";
import {DeleteModal} from "@/components/DeleteModal";

export type GalleryProps = {
  stateKey: string,
  removeImage: (state: any, action: Action) => Action
}

const Gallery = (props: GalleryProps) => {
  const images = useAppSelector(state => state[props.stateKey].list);
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [idForDeletion, setIdForDeletion] = useState<string | undefined>(undefined)
  const dispatch = useAppDispatch();

  const onClickDeleteModal = (id: string) => {
    setIdForDeletion(id);
    setShowDeleteModal(true);
  }

  const handleDelete = () => {
    if (idForDeletion !== undefined) dispatch(props.removeImage(idForDeletion));
    setShowDeleteModal(false)
    setIdForDeletion(undefined);
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
  }

  console.log(showDeleteModal, idForDeletion);

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
              <button className="btn btn-error btn-square btn-xs" onClick={() => onClickDeleteModal(image.id)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg></button>
            </div>
            <DeleteModal
              id={image.id}
              key={`${image.id}-${showDeleteModal.toString()}-${(image.id === idForDeletion).toString()}`}
              isOpen={(showDeleteModal && image.id === idForDeletion)}
              title="Confirm Deletion"
              body="Are you sure you want to delete this background? This cannot be undone."
              onCancel={handleCancelDelete}
              onConfirm={handleDelete}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export const GalleryNoSSR  = dynamic(async () => Gallery, { ssr: false });

export default Gallery;
