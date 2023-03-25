import {createSlice, PayloadAction, Slice} from '@reduxjs/toolkit';
import {Database} from "@/slices/database";

const CONFIGURATION_KEY_PREFIX = 'config';

export type AppConfig = {
  openaiApiKey: string
}

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
      const data = JSON.parse(localStorage.getItem(key));
      const keyInConfig = key.split('_')[1];
      config[keyInConfig] = data;
    }
    return config;
  } else {
    console.warn('Cannot load from localstorage as not in browser.');
    return [];
  }
}

export const { updateConfig } = configurationSlice.actions;
