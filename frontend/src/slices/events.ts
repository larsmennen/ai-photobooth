import {createSlice, PayloadAction, Slice} from '@reduxjs/toolkit';

export type AppEvents = {
  scrollGalleryToTop: boolean
}

type AppEventsKey = keyof AppEvents;

export type UpdateEventsAction = {
  key: string;
  value: any;
}

export const eventsSlice: Slice = createSlice({
  name: 'events',
  initialState: {
    scrollGalleryToTop: false
  },
  reducers: {
    updateEvent: (state, action: PayloadAction<UpdateEventsAction>) => {
      const newState = {...state};
      newState[action.payload.key] = action.payload.value;
      return newState;
    },
  },
})

export const { updateEvent } = eventsSlice.actions;
