import { useState } from "react";
import {Configuration, OpenAIApi} from "openai";
import {useAppDispatch, useAppSelector} from "@/store";
import {addBackground} from "@/slices/images";
import {nanoid} from "@reduxjs/toolkit";
import nextBase64 from "next-base64";
import {EnhancedPromptModal} from "@/components/EnhancedPromptModal";

const IMAGE_SIZE = 1024;
const FINAL_IMAGE_WIDTH = 1820; // For 16:9 ratio
const SYSTEM_PROMPT_ENHANCE_IMAGE_PROMPT = `You are a helpful assistant that is particularly good at providing great prompts for text-to-image models. You only output 1 prompt each time, and NOTHING else.
`
const USER_PROMPT_ENHANCE_IMAGE_PROMPT = `
I have a very large image model that can generate images from an input prompt. It was trained on all publicly available internet images and their descriptions.
You are an assistant that generates amazing high-quality prompts for this model so that the model outputs a nice looking image to be used as a background for a photoshoot.
Make sure to include all of the following and make sure the resulting prompt is at most 3 sentences in length.
The image should show:
`

type FormState = { type: "guide-me" | "free-form"; where: string; what: string; style: string; prompt: string; };

class CustomFormData extends FormData {
  getHeaders() {
    return {};
  }
}

const BackgroundGenerator: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showEnhancedPromptModal, setShowEnhancedPromptModal] = useState<boolean>(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string>('');
  const [formState, setFormState] = useState<FormState>({
    type: "guide-me",
    where: "",
    what: "",
    style: "",
    prompt: ""
  });

  const openaiApiKey = useAppSelector(state => state.configuration.openaiApiKey);
  const openaiConfiguration = new Configuration({
    apiKey: openaiApiKey,
    formDataCtor: CustomFormData // Hacky fix for https://github.com/openai/openai-node/issues/75
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
    setFormState((prevState: FormState) => ({...prevState, type: type === 'free-form' ? 'guide-me' : 'free-form'}));
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
    const id = `${Date.now()}-${nanoid()}`;
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
    });
    setShowEnhancedPromptModal(false);
  }

  /*
   * Use GPT3.5 to enhance the prompt
   */
  const enhancePrompt = async (prompt: string): Promise<string> => {
    const res = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {role: 'system', content: SYSTEM_PROMPT_ENHANCE_IMAGE_PROMPT},
        {role: 'user', content: `${USER_PROMPT_ENHANCE_IMAGE_PROMPT}${prompt}`},
      ]
    });
    if (res.status !== 200) {
      alert('Unsuccessful request to OpenAI, refresh page?');
      console.error(res);
      return '';
    }
    if (!res.data.choices[0].message) {
      alert('Unsuccessful response, check return');
      console.error(res);
      return '';
    }
    const enhancedPrompt = res.data.choices[0].message?.content;
    setEnhancedPrompt(enhancedPrompt);
    setShowEnhancedPromptModal(true);
    return enhancedPrompt;
  }

  const dataType64toFile = (b64Data: string, filename: string): File => {
    const mime = "image/png";
    const bstr = nextBase64.decode(b64Data);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const newFile = new File([u8arr], filename, {
      type: mime,
    });
    return newFile;
  };

  /*
   * Extend a square image into a wider image by splitting it (with overlap)
   * and then sending both to DALLE for completion, then merging back into one
   * image. This is to get around the fact that DALLE only outputs square images
   */
  const extendImage = async (width: number, targetWidth: number, image: string, prompt: string) => {
    const extraPixelsEachSide = (targetWidth - width) / 2;
    const encodedImage = nextBase64.encode(image);

    // Create a targetWidth x width canvas and paste image in the middle.
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = width;
    const ctx = canvas.getContext('2d', {alpha: true});
    if (!ctx) return;
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, targetWidth, width);
    const imageObj = new Image();
    imageObj.onload = async () => {

      // This needs some refactor/cleanup..

      // Draw in middle
      ctx.drawImage(imageObj, extraPixelsEachSide, 0);

      // Cut out two images
      const leftCanvas = document.createElement('canvas');
      leftCanvas.width = width;
      leftCanvas.height = width;
      const leftCtx = leftCanvas.getContext('2d', {alpha: true});
      if (!leftCtx) return;
      leftCtx.fillStyle = "rgba(0, 0, 0, 0)";
      leftCtx.fillRect(0, 0, width, width);
      leftCtx.drawImage(canvas, 0, 0, width, width, 0, 0, width, width);
      const leftImage = leftCanvas.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, "");
      const rightCanvas = document.createElement('canvas');
      rightCanvas.width = width;
      rightCanvas.height = width;
      const rightCtx = rightCanvas.getContext('2d', {alpha: true});
      if (!rightCtx) return;
      rightCtx.fillStyle = "rgba(0, 0, 0, 0)";
      rightCtx.fillRect(0, 0, width, width);
      rightCtx.drawImage(canvas, targetWidth - width, 0, width, width, 0, 0, width, width);
      const rightImage = rightCanvas.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, "");

      // Fill in images
      const leftFile = dataType64toFile(leftImage, "image");
      const resLeft = openai.createImageEdit(
        leftFile,
        prompt,
        undefined,
        1,
        `${width}x${width}`,
        'b64_json'
      );
      const rightFile = dataType64toFile(rightImage, "image");
      const resRight = openai.createImageEdit(
        rightFile,
        prompt,
        undefined,
        1,
        `${width}x${width}`,
        'b64_json'
      );
      // Send in parallel
      await Promise.all([resLeft, resRight]).then((values) => {

        const [resLeft, resRight] = values;

        if (resLeft.status !== 200) {
          alert('Unsuccessful request to OpenAI, refresh page?');
          console.error(resLeft);
        }
        if (resRight.status !== 200) {
          alert('Unsuccessful request to OpenAI, refresh page?');
          console.error(resRight);
        }

        // Merge the two images together
        const leftImageObj = new Image();
        leftImageObj.onload = () => {
          ctx.drawImage(leftImageObj, 0, 0);
          const rightImageObj = new Image();
          rightImageObj.onload = () => {
            ctx.drawImage(rightImageObj, targetWidth - width, 0);
            pushNewImage(canvas.toDataURL());
          };
          rightImageObj.src = "data:image/png;base64," + resRight.data.data[0]['b64_json'];
        };
        leftImageObj.src = "data:image/png;base64," + resLeft.data.data[0]['b64_json'];
      })
    };
    imageObj.src = "data:image/png;base64," + encodedImage;
  }

  const handleFormSubmit = async () => {
    setIsLoading(true);

    // Enhance the prompt
    const enhancedPrompt = await enhancePrompt(formState.prompt);

    // Generate the image
    const imageGenRes = await openai.createImage({
      prompt: enhancedPrompt,
      n: 1,
      size: `${IMAGE_SIZE}x${IMAGE_SIZE}`,
      response_format: 'b64_json'
    });
    if (imageGenRes.status !== 200) {
      alert('Unsuccessful request to OpenAI, refresh page?');
      console.error(imageGenRes);
      return;
    }
    const imageDataEncoded = imageGenRes.data?.data[0]['b64_json'];
    if (!imageDataEncoded) {
      alert('Unsuccessful request to OpenAI, check response');
      console.error(imageGenRes);
      return;
    }
    const imageData = nextBase64.decode(imageDataEncoded);

    // Extend the image
    await extendImage(IMAGE_SIZE, FINAL_IMAGE_WIDTH, imageData, enhancedPrompt);

  }

  const {type, prompt} = formState;

  return (
    <div>
      <EnhancedPromptModal prompt={enhancedPrompt} showModal={showEnhancedPromptModal} />
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
              placeholder="E.g. &quot;A giant turtle&quot;, &quot;A dog in a spacesuit&quot;, &quot;Huge piles of books&quot;, ..."
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

