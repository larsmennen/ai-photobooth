import Head from 'next/head'
import {GalleryNoSSR} from "@/components/Gallery";
import {Wizard} from "@/components/Wizard";
import {removeBackground} from "@/slices/images";
import {BackgroundGenerator} from "@/components/BackgroundGenerator";
import React, {useState} from "react";
import {Modal} from "@/components/Modal";
import {ConfigurationModal} from "@/components/ConfigurationModal";

export default function Photobooth() {

  const [showModal, setShowModal] = useState(false);

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
        <div className="flex flex-row justify-center items-center">
          <div className="flex-1"></div>
          <article className="prose">
            <h1>AI Photobooth</h1>
          </article>
          <div className="flex-1">
            <button className="btn btn-ghost flex ml-auto" onClick={() => setShowModal(true)}>Support</button>
            <Modal
                id={'help'}
                key={`help-${showModal.toString()}`}
                isOpen={showModal}
                title="Not working?"
                body="Check you've set NEXT_PUBLIC_OPENAI_API_KEY in your .env.local file."
                onCancel={() => setShowModal(false)}
                onConfirm={() => setShowModal(false)}
              />
          </div>
        </div>
        <div className="flex flex-row h-screen">
          <div className="flex-1 basis-1/2 overflow-y-auto bg-gray-100">
            <GalleryNoSSR stateKey={'backgrounds'} removeImage={removeBackground} />
          </div>
          <div className="flex-1 basis-1/2 bg-gray-300">
            <BackgroundGenerator />
          </div>
        </div>
      </main>
    </>
  )
}
