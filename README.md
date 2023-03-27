# ai-photobooth

AI Photobooth: Create beautiful backgrounds for a photobooth quickly using AI.

## How it works

Users can enter either a prompt directly, or specify a "what", "where", and "style" for the background. It then:
1. Asks GPT-3.5 to write a better prompt based on this info.
2. Generates a 1024x1024 image using DALL-E.
3. Extends this image (using DALL-E again twice) on both sides so it becomes a 1820x1024 image (which is 16:9 aspect ratio).
4. The image will be stored in a local IndexedDB, so it's persistent after refresh.
5. On the left you see a gallery of all backgrounds generated so far. Clicking it makes it fullscreen.

The idea is to use this on a projector, so that one can take pictures in front of it.

## How to use

This requires an OpenAI API key. You will be prompted for the key when you launch the app.
Afterwards it'll be stored in your localstorage. 
Alternatively you can set the `NEXT_PUBLIC_OPENAI_API_KEY` environment variable, but this will be written into the JS, so this is *not safe to run outside localhost*.

To run:

1. Run `npm run dev` in `frontend/`
2. Go to `localhost:3000`.

## Unused components

The `WebcamCapture` component is not used, but you may be interested in if you want to use the webcam as a camera.
The component allows you to capture an image using your webcam, and then (using the BodyPix model running on TensorflowJS) removes the background.
The only bit remaining would be to paste the background into the image after you removed the background.
