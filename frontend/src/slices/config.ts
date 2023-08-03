import {createSlice, PayloadAction, Slice} from '@reduxjs/toolkit';

const CONFIGURATION_KEY_PREFIX = 'config';

export enum ImageGeneratorApis {
  OpenAI = 'OpenAI',
  Midjourney = 'Midjourney',
}

export type AppConfig = {
  imageGeneratorApi: ImageGeneratorApis;
  imageGeneratorApiKey: string;
}

type AppConfigKey = keyof AppConfig;

export type UpdateConfigAction = {
  key: string;
  value: any;
}

const getImageGeneratorApiFromEnv = (): ImageGeneratorApis => {
  const imageGeneratorApi = process.env.NEXT_PUBLIC_IMAGE_GENERATOR_API;
  if (!imageGeneratorApi) {
    return ImageGeneratorApis.OpenAI;
  }
  switch (imageGeneratorApi) {
    case ImageGeneratorApis.OpenAI:
      return ImageGeneratorApis.OpenAI;
    case ImageGeneratorApis.Midjourney:
      return ImageGeneratorApis.Midjourney;
    default:
      console.error(`NEXT_PUBLIC_IMAGE_GENERATOR_API is not a valid value. Got ${imageGeneratorApi}`);
      return ImageGeneratorApis.OpenAI;
  }
}

const getImageGeneratorApiKeyFromEnv = (): string => {
  let key = process.env.NEXT_PUBLIC_IMAGE_GENERATOR_API_KEY ? process.env.NEXT_PUBLIC_IMAGE_GENERATOR_API_KEY : '';
  if (key === '') key = process.env.NEXT_PUBLIC_OPENAI_API_KEY ? process.env.NEXT_PUBLIC_OPENAI_API_KEY : '';
  return key;
}

export const configurationSlice: Slice = createSlice({
  name: 'configuration',
  initialState: {
    imageGeneratorApi: getImageGeneratorApiFromEnv(),
    imageGeneratorApiKey: getImageGeneratorApiKeyFromEnv(),
  },
  reducers: {
    updateConfig: (state, action: PayloadAction<UpdateConfigAction>) => {
      const newState = {...state};
      newState[action.payload.key] = action.payload.value;
      localStorage.setItem(`${CONFIGURATION_KEY_PREFIX}_${action.payload.key}`, JSON.stringify(action.payload.value));
      return newState;
    },
  },
})

export const getConfigurationFromLocalStorage = () => {
  const config: AppConfig = {
    imageGeneratorApi: ImageGeneratorApis.OpenAI,
    imageGeneratorApiKey: '',
  };
  if (typeof window !== 'undefined') {
    const localstorageKeys = Object.keys(localStorage).filter((key) => key.startsWith(CONFIGURATION_KEY_PREFIX))
    for (let key of localstorageKeys) {
      const jsonData = localStorage.getItem(key);
      if (!jsonData) {
        console.error(`Error when retrieving item with key ${key} from localstorage`);
        return [];
      }
      const data = JSON.parse(jsonData);
      const keyInConfig = key.split('_')[1] as AppConfigKey;
      config[keyInConfig] = data;
    }
    return config;
  } else {
    console.warn('Cannot load from localstorage as not in browser.');
    return [];
  }
}

export const { updateConfig } = configurationSlice.actions;
