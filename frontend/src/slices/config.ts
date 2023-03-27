import {createSlice, PayloadAction, Slice} from '@reduxjs/toolkit';

const CONFIGURATION_KEY_PREFIX = 'config';

export type AppConfig = {
  openaiApiKey: string
}

type AppConfigKey = keyof AppConfig;

export type UpdateConfigAction = {
  key: string;
  value: any;
}

export const configurationSlice: Slice = createSlice({
  name: 'configuration',
  initialState: {
    openaiApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY ? process.env.NEXT_PUBLIC_OPENAI_API_KEY : ''
  },
  reducers: {
    updateConfig: (state, action: PayloadAction<UpdateConfigAction>) => {
      state[action.payload.key] = state[action.payload.value];
      localStorage.setItem(`${CONFIGURATION_KEY_PREFIX}_${action.payload.key}`, JSON.stringify(action.payload.value));
    },
  },
})

export const getConfigurationFromLocalStorage = () => {
  const config: AppConfig = {
    openaiApiKey: ''
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
