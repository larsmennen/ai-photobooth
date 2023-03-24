import {createSlice, PayloadAction, Slice} from '@reduxjs/toolkit';
import {Database} from "@/slices/database";

export const IMAGE_KEY_PREFIX = 'image';
export const BACKGROUND_KEY_PREFIX = 'background';

export interface Image {
  id: string;
  data: string;
  prompt: string;
}

interface ImagesState {
  list: Image[];
}

const initialState: ImagesState = {
  list: [],
};

const createImgSlice = (prefix_key: string): Slice => {
  const db = new Database<Image>('imageStore', prefix_key);

  const slice = createSlice({
    name: prefix_key,
    initialState,
    reducers: {
      addImage: (state, action: PayloadAction<Image>) => {
        state.list.push(action.payload);
        db.saveItem(action.payload);
      },
      removeImage: (state, action: PayloadAction<string>) => {
        state.list = state.list.filter(image => image.id !== action.payload);
        db.removeItem(action.payload);
      },
    },
  });

  return slice;
}

export const imagesSlice = createImgSlice(IMAGE_KEY_PREFIX);
export const { addImage, removeImage } = imagesSlice.actions;
export const backgroundsSlice = createImgSlice(BACKGROUND_KEY_PREFIX);
export const { addImage: addBackground, removeImage: removeBackground } = backgroundsSlice.actions;


