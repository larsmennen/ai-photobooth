import { useState } from "react";
import {Configuration, OpenAIApi} from "openai";
import nextBase64 from "next-base64";
import {useAppDispatch} from "@/store";
import {addBackground} from "@/slices/images";
import {nanoid} from "@reduxjs/toolkit";

const IMAGE_SIZE = 1024;

type FormState = { type: "guide-me" | "free-form"; where: string; what: string; style: string; prompt: string; };

const BackgroundGenerator: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formState, setFormState] = useState<FormState>({
    type: "guide-me",
    where: "",
    what: "",
    style: "",
    prompt: ""
  });

  const openaiConfiguration = new Configuration({
    apiKey: '',
  });
  const openai = new OpenAIApi(openaiConfiguration);



  function canMakePrompt(state: FormState): {valid: boolean, errorMsg: string} {
    if (state.where === "" && state.what === "" && state.style === "") {
      return {valid: false, errorMsg: ""};
    }
    if (state.where === "" && state.what === "") {
      return {valid: false, errorMsg: "Specify at least the where or the what"};
    }
    return {valid: true, errorMsg: ""}
  }

  function getPrompt(state: FormState): string {
    if (!canMakePrompt(state).valid) {
      return ""
    }
    const style = state.style === "" ? "A photorealistic picture" : state.style;
    if (state.where === "") {
      return `${style} of ${state.what}`;
    }
    if (state.what === "") {
      return `${style} of ${state.where}`;
    }
    return `${style} of ${state.what} in ${state.where}`;
  }

  const handleTypeToggle = () => {
    setFormState((prevState) => ({...prevState, type: type === 'free-form' ? 'guid-me' : 'free-form'}));
  };

  const handleFormChange = (field: keyof FormState, value: string) => {
    if (field === 'prompt') {
      setFormState((prevState) => ({...prevState, prompt: value, what: '', where: '', style: ''}))

    } else {
      setFormState((prevState) => {
        const newState = {...prevState, [field]: value};
        return {...newState, prompt: getPrompt(newState)};
      });
    }
  };

  const pushNewImage = (dataURL: string) => {
    const id = nanoid();
    dispatch(addBackground({
      id,
      data: dataURL,
      prompt: formState.prompt
    }));
    setIsLoading(false);
    setFormState({
      type: formState.type,
      where: "",
      what: "",
      style: "",
      prompt: "",
    })
  }

  const handleFormSubmit = async () => {
    setIsLoading(true);

    const res = await openai.createImage({
      prompt: formState.prompt,
      n: 1,
      size: `${IMAGE_SIZE}x${IMAGE_SIZE}`,
      response_format: 'b64_json'
    });
    if (res.status !== 200) {
      alert('Unsuccessful request to OpenAI, refresh page?');
    }
    const image = nextBase64.decode(res.data.data[0]['b64_json']);
    const canvas = document.createElement('canvas');
    canvas.width = IMAGE_SIZE;
    canvas.height = IMAGE_SIZE;

    const ctx = canvas.getContext('2d');
    const imageObj = new Image();
    imageObj.onload = () => {
      ctx.drawImage(imageObj, 0, 0);
      pushNewImage(canvas.toDataURL());
    };
    imageObj.src = "data:image/png;base64," + res.data.data[0]['b64_json'];

  }

  const {type, prompt} = formState;

  return (
    <div>
      <h1 className="text-2xl font-bold">Generate an AI background</h1>
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Guide me</span>
          <input type="checkbox" className="toggle" checked={type === 'free-form'} onChange={handleTypeToggle} disabled={isLoading} />
          <span className="label-text">Free-form</span>
        </label>
      </div>
      {type === "free-form" ? (
        <div className="mt-4">
          <textarea
            className="form-input textarea textarea-bordered h-48 w-full resize-none max-w-xs"
            placeholder="E.g. &quot;A photorealistic picture of the Melbourne skyline at sunset with Hulk walking around&quot;"
            disabled={isLoading}
            defaultValue={formState.prompt}
            onChange={(event) =>
              handleFormChange("prompt", event.target.value)
            }
          />
        </div>
      ) : (
        <div>
          <div className="mt-4 form-control w-full max-w-xs">
            <label htmlFor="Where" className="form-label label">
              <span className="label-text">Where</span>
            </label>
            <input
              type="text"
              className="form-input input input-bordered w-full max-w-xs"
              placeholder="E.g. &quot;Paris&quot;, &quot;A beautiful rose garden&quot;, &quot;Melbourne with Northern lights&quot;, ..."
              value={formState.where}
              disabled={isLoading}
              onChange={(event) =>
                handleFormChange("where", event.target.value)
              }
            />
          </div>
          <div className="mt-4 form-control w-full max-w-xs">
            <label htmlFor="What" className="form-label label">
              <span className="label-text">What</span>
            </label>
            <input
              type="text"
              className="form-input input input-bordered w-full max-w-xs"
              placeholder="E.g. &quot;A giant turtle&quot;, &quot;Dan Andrews in a spacesuit&quot;, &quot;Huge piles of quantum physics books&quot;, ..."
              value={formState.what}
              disabled={isLoading}
              onChange={(event) =>
                handleFormChange("what", event.target.value)
              }
            />
          </div>
          <div className="mt-4 form-control w-full max-w-xs">
            <label htmlFor="Style" className="form-label label">
              <span className="label-text">Style</span>
            </label>
            <input
              type="text"
              className="form-input input input-bordered w-full max-w-xs"
              placeholder="E.g. &quot;Photorealistic picture&quot;, &quot;Monet painting&quot;, &quot;90s retro poster&quot;, ..."
              value={formState.style}
              disabled={isLoading}
              onChange={(event) =>
                handleFormChange("style", event.target.value)
              }
            />
          </div>
          <div className="mt-4">
            <p>{prompt}</p>
          </div>
        </div>
      )}
      <button className={`btn btn-wide btn-accent ${isLoading ? "loading": ""}`} onClick={handleFormSubmit}>{isLoading ? "" : "Perform AI Magic 🪄"}</button>
    </div>
  )

}

export default BackgroundGenerator;

