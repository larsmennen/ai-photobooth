import React, {useEffect, useState} from 'react';
import { PayloadAction} from "@reduxjs/toolkit";
import {RootState, useAppDispatch, useAppSelector} from "@/store";
import dynamic from "next/dynamic";
import FullscreenImageOverlay
  from "../FullscreenImageOverlay/FullscreenImageOverlay";
import {Modal} from "@/components/Modal";
import {updateEvent} from "@/slices/events";
import {useSelector} from "react-redux";

export type GalleryProps = {
  stateKey: string,
  removeImage: (id: any) => PayloadAction<any>
  containerRef: React.RefObject<HTMLDivElement> | undefined
}

const Gallery = (props: GalleryProps) => {
  const images = useAppSelector((state: RootState) => (state as any)[props.stateKey].list);
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [idForDeletion, setIdForDeletion] = useState<string | undefined>(undefined)
  
  const dispatch = useAppDispatch();
  const atTop = useSelector((state: RootState) => state.events.scrollGalleryToTop);

  useEffect(() => {
    if (atTop && props.containerRef && props.containerRef.current) {
      props.containerRef.current.scrollTo({top: 0, behavior: 'smooth'});
      dispatch(updateEvent({key: 'scrollGalleryToTop', value: false}));
    }
  }, [atTop, dispatch, props.containerRef]);

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

  useEffect(() => {
    if (props.containerRef && props.containerRef.current) {
      const handleScroll = () => {
        if (props.containerRef && props.containerRef.current) {
          const scrollTop = props.containerRef.current.scrollTop;
          if (scrollTop === 0) {
            dispatch(updateEvent({key: 'scrollGalleryToTop', value: true}));
          } else {
            dispatch(updateEvent({key: 'scrollGalleryToTop', value: false}));
          }
        }
      };
      props.containerRef.current.addEventListener("scroll", handleScroll);
      return () => {
        props.containerRef?.current?.removeEventListener("scroll", handleScroll);
      };
    }
  }, [dispatch, props.containerRef]);

  if (images.length) {
    // Put newest first
    const imagesToShow = [...images].reverse();
    return (
      <div className="grid grid-cols-2 gap-4 p-6">
        {imagesToShow.map((image) => (
          <div key={image.id}
               className="card card-compact w-full bg-base-100 shadow-xl flex items-center">
            <figure className={"mx-auto"}>
              <FullscreenImageOverlay
                key={`img-${image.id}`}
                src={image.data}
                alt={image.prompt}
                width={1024}
                height={1024}
              />
            </figure>
            <div className="card-body w-full">
              <p>{image.prompt}</p>
              <div className="card-actions justify-end">
                <button className="btn btn-error btn-square btn-xs"
                        onClick={() => onClickDeleteModal(image.id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <Modal
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
  } else {
    return (
      <div className="flex justify-center items-center h-full">
        <h2 className="prose text-4xl">
          Generate some images on the right to start!
        </h2>
      </div>
    );
  }
};

export const GalleryNoSSR  = dynamic(async () => Gallery, { ssr: false });

export default Gallery;
