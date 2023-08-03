import { Midjourney } from "midjourney";
import axios from 'axios';
import sharp from 'sharp';

export const config = {
  api: {
    responseLimit: false,
  },
}

const client = new Midjourney({
  ServerId: process.env.SERVER_ID,
  ChannelId: process.env.CHANNEL_ID,
  SalaiToken: process.env.SALAI_TOKEN as string,
  Debug: true,
  Ws: true, //enable ws is required for remix mode (and custom zoom)
});

export default async function handler(req: any, res: any) {
  await client.init();

  const images = await client.Imagine(
    req.body.prompt,
    (uri: string, progress: string) => {
      console.log("Imagine.loading", uri, "progress", progress);
    }
  );

  if (!images) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Failed to generate image' }));
    return;
  }

  // Fetch the image
  const response = await axios.get(images.uri, { responseType: 'arraybuffer' });

  // Get the image as a Buffer
  const imageBuffer = Buffer.from(response.data, 'binary');

  // Use sharp to get image metadata (we need width and height)
  const metadata = await sharp(imageBuffer).metadata();

  // Calculate the center of the image
  const centerX = Math.floor((metadata.width as number) / 2);
  const centerY = Math.floor((metadata.height as number) / 2);

  // Split the image into four quadrants
  const topLeft = await sharp(imageBuffer).extract({ left: 0, top: 0, width: centerX, height: centerY }).png().toBuffer();
  const topRight = await sharp(imageBuffer).extract({ left: centerX, top: 0, width: centerX, height: centerY }).png().toBuffer();
  const bottomLeft = await sharp(imageBuffer).extract({ left: 0, top: centerY, width: centerX, height: centerY }).png().toBuffer();
  const bottomRight = await sharp(imageBuffer).extract({ left: centerX, top: centerY, width: centerX, height: centerY }).png().toBuffer();

  // Return the Base64 strings as an array
  const separateImages = {
    'topLeft': topLeft.toString('base64'),
    'topRight': topRight.toString('base64'),
    'bottomLeft': bottomLeft.toString('base64'),
    'bottomRight': bottomRight.toString('base64'),
  }

  res.statusCode = 201;
  res.end(JSON.stringify(separateImages));
}