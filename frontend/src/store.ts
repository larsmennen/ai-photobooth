import {AnyAction, configureStore} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {
  BACKGROUND_KEY_PREFIX,
  backgroundsSlice,
  Image,
  IMAGE_KEY_PREFIX,
  imagesSlice
} from './slices/images';
import {Database} from "@/slices/database";
import {Dispatch} from "redux";
import {
  AppConfig,
  configurationSlice,
  getConfigurationFromLocalStorage
} from "@/slices/config";

const getImagesFromIndexedDB = async (key_prefix: string): Promise<Image[]> => {
  let db;
  try {
    db = new Database<Image>('imageStore', key_prefix);
  } catch (e) {
    console.error('Could not open IndexedDB', e);
    return [];
  }
  try {
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
    configuration: getConfigurationFromLocalStorage(),
  };

  const store = configureStore({
    reducer: {
      images: imagesSlice.reducer,
      backgrounds: backgroundsSlice.reducer,
      configuration: configurationSlice.reducer,
    },
    preloadedState,
  });

  return store;
}

export type RootState = { configuration: AppConfig, images: any, backgrounds: any};
export type AppDispatch = Dispatch<AnyAction>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
