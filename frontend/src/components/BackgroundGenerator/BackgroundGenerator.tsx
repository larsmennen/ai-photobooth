import React, { useState} from "react";
import {Configuration, OpenAIApi} from "openai";
import {useAppDispatch, useAppSelector} from "@/store";
import {addBackground} from "@/slices/images";
import {nanoid} from "@reduxjs/toolkit";
import nextBase64 from "next-base64";
import {EnhancedPromptModal} from "@/components/EnhancedPromptModal";
import {PresetButtons} from "@/components/PresetButtons";
import {
  InputWithRef,
  RefWithMethods
} from "@/components/PresetButtons/PresetButtons";

const IMAGE_SIZE = 1024;
const FINAL_IMAGE_WIDTH = 1820; // For 16:9 ratio
const SYSTEM_PROMPT_ENHANCE_IMAGE_PROMPT = `You are a helpful assistant that is particularly good at describing images vividly and concisely.
You only output 1 description each time, and NOTHING else. For example, you do NOT say "here is a description".
You always make sure to include the mentioned style in your response in the first line. If a camera model is mentioned in the keywords, you include it in your response.
`
const USER_PROMPT_ENHANCE_IMAGE_PROMPT = `
Imagine you're trying to explain an image to someone who can't see it.
You must stay under 400 characters, and because of how little space you have, you don't need to write in full sentences.
Use descriptive wording like "the bridge is colored a bold red with broad brush strokes", rather than subjective descriptions.
Make sure to include the style in the first line of your description.

I will give you just some key words about the images subject, and about the style of the image.
You need to then take those and paint a picture with your description.

Keywords:
`

const PRECONFIGURED_OPTIONS = {
  'what': ["Kangaroo", "Tulip field", "Dutch windmill", "Milky Way", "German Shepherd", "Golden Gate Bridge", "Koala", "Roses", "Jasmyn flowers", "Hindu temple" ],
  'where': ['Australian outback','Amsterdam houses', "Sydney Opera House", "Flinders Street Station", "Cambridge", "Indian wedding", "Northern Lights"],
  'style': ['Oil painting', "Impressionist", "Photorealistic", "Van Gogh", "Pastel", "Photobooth background" ]
}

// In case you want to have something more detailed than what's on the button go into the prompt
// These mappings are applied to the prompt before sending it to GPT-3.5.
const DETAILED_OPTIONS = {
  "Photorealistic": "Photorealistic 4k image shot on Canon EOS 1000D",
  "Cambridge": "Cambridge (UK)"
}

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
  const [revision, setRevision] = useState<number>(0);
  const [formState, setFormState] = useState<FormState>({
    type: "guide-me",
    where: "",
    what: "",
    style: "",
    prompt: ""
  });
  const whereInput = React.createRef<HTMLInputElement>();
  const whatInput = React.createRef<HTMLInputElement>();
  const styleInput = React.createRef<HTMLInputElement>();

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
    const style = state.style === "" ? "A 4k picture" : state.style;
    if (state.where === "") {
      return `${state.what}, style: ${style}`;
    }
    if (state.what === "") {
      return `${state.where}, style: ${style}`;
    }
    return `${state.what}, ${state.where}, style: ${style}`;
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

  const clearForm = () => {
    setShowEnhancedPromptModal(false);
    setIsLoading(false);
    setFormState({
      type: formState.type,
      where: "",
      what: "",
      style: "",
      prompt: "",
    });
    setRevision(revision + 1);
  }

  const pushNewImage = (dataURL: string) => {
    const id = `${Date.now()}-${nanoid()}`;
    dispatch(addBackground({
      id,
      data: dataURL,
      prompt: formState.prompt
    }));
    clearForm();
  }

  /*
   * Use GPT3.5 to enhance the prompt
   */
  const enhancePrompt = async (prompt: string): Promise<string> => {

    for (const [key, value] of Object.entries(DETAILED_OPTIONS)) {
      prompt = prompt.replaceAll(key, value);
    }

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
    let imageGenRes;
    try {
      imageGenRes = await openai.createImage({
        prompt: enhancedPrompt,
        n: 1,
        size: `${IMAGE_SIZE}x${IMAGE_SIZE}`,
        response_format: 'b64_json'
      });
    } catch (error: any) {
      console.error('Error when calling OpenAI image generation');
      let message: string;
      if (error.response) {
        console.error(error.response.status);
        console.error(error.response.data);
        message = error.response.data.error.message;
      } else {
        console.error(error.message);
        message = error.message;
      }
      if (message.includes('safety system')) {
        alert('OpenAI\s safety system rejected your prompt. Try again with something less saucy :)');
      } else {
        alert('Unsuccessful request to OpenAI, refresh page?');
      }
      clearForm();
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
    <div className="p-10 w-full">
      <EnhancedPromptModal prompt={enhancedPrompt} showModal={showEnhancedPromptModal} />
      <div className="flex justify-center">
        <h1 className="flex-1 text-2xl font-bold">{type === 'free-form' ? 'Write your own prompt' : 'Choose from the following'}</h1>
        <div className="form-control flex mt-auto">
          <label htmlFor="mode" className="form-label label">
            <span className="label-text pr-5">Advanced free-form mode</span>
            <input type="checkbox" name="mode" className="toggle" checked={type === 'free-form'} onChange={handleTypeToggle} disabled={isLoading} />
          </label>
        </div>
      </div>
      {type === "free-form" ? (
        <div className="mt-4">
          <textarea
            className="form-input textarea textarea-bordered h-48 w-full resize-none max-w-md"
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
          <div className="mt-4 form-control w-full">
            <label htmlFor="Where" className="form-label label">
              <span className="label-text text-xl font-bold">Where</span>
            </label>
            <PresetButtons key={`where-buttons-${revision}`} presets={PRECONFIGURED_OPTIONS['where']} inputRef={whereInput as unknown as RefWithMethods} />
            <InputWithRef
              type="text"
              className="form-input input input-bordered w-full max-w-md"
              placeholder="E.g. &quot;Paris&quot;, &quot;A beautiful rose garden&quot;, &quot;Melbourne with Northern lights&quot;, ..."
              value={formState.where}
              disabled={isLoading}
              ref={whereInput}
              onChange={(val: string | React.ChangeEvent<HTMLInputElement>) =>
                handleFormChange("where", typeof val === 'string' ? val : val.target.value)
              }
            />
          </div>
          <div className="mt-4 form-control w-full">
            <label htmlFor="What" className="form-label label">
              <span className="label-text text-xl font-bold">What</span>
            </label>
            <PresetButtons key={`what-buttons-${revision}`} presets={PRECONFIGURED_OPTIONS['what']} inputRef={whatInput as unknown as RefWithMethods} />
            <InputWithRef
              type="text"
              className="form-input input input-bordered w-full max-w-md"
              placeholder="E.g. &quot;A giant turtle&quot;, &quot;A dog in a spacesuit&quot;, &quot;Huge piles of books&quot;, ..."
              value={formState.what}
              disabled={isLoading}
              ref={whatInput}
              onChange={(val: string | React.ChangeEvent<HTMLInputElement>) =>
                handleFormChange("what", typeof val === 'string' ? val : val.target.value)
              }
            />
          </div>
          <div className="mt-4 form-control w-full">
            <label htmlFor="Style" className="form-label label">
              <span className="label-text text-xl font-bold">Style</span>
            </label>
            <PresetButtons key={`style-buttons-${revision}`} presets={PRECONFIGURED_OPTIONS['style']} inputRef={styleInput as unknown as RefWithMethods} />
            <InputWithRef
              type="text"
              className="form-input input input-bordered w-full max-w-md"
              placeholder="E.g. &quot;Photorealistic picture&quot;, &quot;Monet painting&quot;, &quot;90s retro poster&quot;, ..."
              value={formState.style}
              disabled={isLoading}
              ref={styleInput}
              onChange={(val: string | React.ChangeEvent<HTMLInputElement>) =>
                handleFormChange("style", typeof val === 'string' ? val : val.target.value)
              }
            />
          </div>
          <div className="mt-4">
            <p>{prompt}</p>
          </div>
        </div>
      )}
      <button className={`btn mt-4 btn-wide btn-accent ${isLoading ? "loading": ""}`} onClick={handleFormSubmit}>{isLoading ? "" : "Perform AI Magic 🪄"}</button>
    </div>
  )

}

export default BackgroundGenerator;

