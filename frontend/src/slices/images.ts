import {createSlice, PayloadAction, Slice} from '@reduxjs/toolkit';

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
  const slice = createSlice({
    name: prefix_key,
    initialState,
    reducers: {
      addImage: (state, action: PayloadAction<Image>) => {
        state.list.push(action.payload);
        localStorage.setItem(`${prefix_key}_${action.payload.id}`, JSON.stringify({
          image: action.payload.data,
          prompt: action.payload.prompt,
        }));
      },
      removeImage: (state, action: PayloadAction<string>) => {
        state.list = state.list.filter(image => image.id !== action.payload);
        localStorage.removeItem(`${prefix_key}_${action.payload}`);
      },
    },
  });

  return slice;
}

export const imagesSlice = createImgSlice(IMAGE_KEY_PREFIX);
export const { addImage, removeImage } = imagesSlice.actions;
export const backgroundsSlice = createImgSlice(BACKGROUND_KEY_PREFIX);
export const { addImage: addBackground, removeImage: removeBackground } = backgroundsSlice.actions;
