import Head from 'next/head'
import {GalleryNoSSR} from "@/components/Gallery";
import {removeBackground} from "@/slices/images";
import {BackgroundGenerator} from "@/components/BackgroundGenerator";
import React, {useRef, useState} from "react";
import {ConfigurationModal} from "@/components/ConfigurationModal";
import {AiFillGithub} from "react-icons/ai";
import {UploadImageModal} from "@/components/UploadImageModal";

export default function Photobooth() {

  const [showUploadModal, setShowUploadModal] = useState(false);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Head>
        <title>AI Photobooth</title>
        <meta name="description" content="Create beautiful backgrounds for a photobooth quickly using AI." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen w-screen flex-col">
        <ConfigurationModal />
        <UploadImageModal key={`uploadImageModal-${showUploadModal}`} isOpen={showUploadModal} onDone={() => setShowUploadModal(false)} />
        <div className="relative">
          <div className="flex flex-row justify-center items-center">
            <div className="absolute top-1 left-1">
              <button className="flex btn btn-accent btn-sm" onClick={() => setShowUploadModal(true)}>Upload Image</button>
            </div>
            <article className="prose">
              <h1>AI Photobooth</h1>
            </article>
            <div className="absolute top-0.5 right-0">
              <a className="flex" href="https://github.com/larsmennen/ai-photobooth">
                <AiFillGithub className="text-4xl" />
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-grow flex-row h-0">
          <div className="flex-1 basis-1/2 bg-gray-100">
            <BackgroundGenerator />
          </div>
          <div className="flex-1 basis-1/2 overflow-y-auto bg-gray-100" ref={gridContainerRef}>
            <GalleryNoSSR stateKey={'backgrounds'} removeImage={removeBackground} containerRef={gridContainerRef} />
          </div>
        </div>
      </main>
    </>
  )
}
