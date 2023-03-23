import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import {
  Image,
  IMAGE_KEY_PREFIX,
  BACKGROUND_KEY_PREFIX,
  imagesSlice,
  backgroundsSlice
} from './slices/images';

const getImagesFromLocalStorage = (key_prefix: string): Image[] => {
  if (typeof window !== 'undefined') {
    const localstorageKeys = Object.keys(localStorage).filter((key) => key.startsWith(key_prefix))
    const images = [];
    for (let key of localstorageKeys) {
      const data = JSON.parse(localStorage.getItem(key));
      const id = key.split('_')[1];
      images.push({
        id: id,
        data: data['image'],
        prompt: data['prompt'],
      })
    }
    return images;
  } else {
    console.warn('Cannot load from localstorage as not in browser.');
    return [];
  }
};

export const store = configureStore({
  reducer: {
    images: imagesSlice.reducer,
    backgrounds: backgroundsSlice.reducer
  },
  preloadedState: {
    images: { list: getImagesFromLocalStorage(IMAGE_KEY_PREFIX) },
    backgrounds: { list: getImagesFromLocalStorage(BACKGROUND_KEY_PREFIX) },
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
