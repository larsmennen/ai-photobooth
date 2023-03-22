import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const IMAGE_KEY_PREFIX = 'image';

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

export const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    addImage: (state, action: PayloadAction<Image>) => {
      state.list.push(action.payload);
      localStorage.setItem(`image_${action.payload.id}`, JSON.stringify({
        image: action.payload.data,
        prompt: action.payload.prompt,
      }));
    },
    removeImage: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(image => image.id !== action.payload);
      localStorage.removeItem(`image_${action.payload}`);
    },
  },
});

export const { addImage, removeImage } = imagesSlice.actions;
