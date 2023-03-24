import {AnyAction, configureStore} from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import {
  Image,
  IMAGE_KEY_PREFIX,
  BACKGROUND_KEY_PREFIX,
  imagesSlice,
  backgroundsSlice
} from './slices/images';
import {Database} from "@/slices/database";
import {Dispatch} from "redux";

const getImagesFromIndexedDB = async (key_prefix: string): Promise<Image[]> => {
  let db;
  try {
    db = new Database<Image>('imageStore', key_prefix);
    const images = await db.getItems();
    return images;
  } catch (error) {
    if (error instanceof DOMException && error.message.includes('specified object stores was not found')){
      // Not initialized yet
      await db.createObjectStore();
      return [];
    }
    console.warn('Cannot load from IndexedDB:', error);
    return [];
  }
};

export async function initializeStore() {
  const preloadedState = {
    images: { list: await getImagesFromIndexedDB(IMAGE_KEY_PREFIX) },
    backgrounds: { list: await getImagesFromIndexedDB(BACKGROUND_KEY_PREFIX) },
  };

  const store = configureStore({
    reducer: {
      images: imagesSlice.reducer,
      backgrounds: backgroundsSlice.reducer,
    },
    preloadedState,
  });

  return store;
}

export type RootState = {images: any, backgrounds: any};
export type AppDispatch = Dispatch<AnyAction>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
