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
    generationStarted(state) {
      state.isGenerating = true;
    },
    generationStopped(state) {
      state.isGenerating = false;
    },
  },
});

const { actions, reducer } = imageSlice;

export const { generationStarted, generationStopped } = actions;

export const imageReducer = reducer;
