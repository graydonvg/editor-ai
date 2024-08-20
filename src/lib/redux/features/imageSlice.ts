import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type State = {
  isGenerating: boolean;
};

const initialState: State = {
  isGenerating: false,
};

const imageSlice = createSlice({
  name: "image",
  initialState,
  reducers: {
    imageGenerationStarted(state) {
      state.isGenerating = true;
    },
    imageGenerationStopped(state) {
      state.isGenerating = false;
    },
  },
});

const { actions, reducer } = imageSlice;

export const { imageGenerationStarted, imageGenerationStopped } = actions;

export const imageReducer = reducer;
