import React, {useState} from 'react';
import {WebcamCapture} from "@/components/WebcamCapture";
import {removeBackground} from "@/slices/images";
import {GalleryNoSSR} from "@/components/Gallery";
import {BackgroundGenerator} from "@/components/BackgroundGenerator";

const Wizard = () => {
  const [step, setStep] = useState(1);

  const steps = ['Create a background', 'Take a picture', 'View and share'];

  const renderStep1 = () => (
    <>
      <GalleryNoSSR stateKey={'backgrounds'} removeImage={removeBackground} containerRef={undefined} />
      <div className="divider divider-horizontal">OR</div>
      <BackgroundGenerator />
    </>
  )

  const renderStep2 = () => (
    <>
      <h2>Step 2</h2>
      <WebcamCapture />
    </>
  )
  const renderStep3 = () => (
    <h2>Step 3</h2>
  )

  return (
    <div className="flex flex-col">
      <ul className="steps">
        {
          steps.map((val, idx) => <li key={val} className={`step ${step === idx + 1 ? 'step-primary' : undefined}`}>{val}</li>)
        }
      </ul>
      <div className="divider"></div>
      <div className="flex flex-row justify-center">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default Wizard;
