import { combineReducers } from "@reduxjs/toolkit";
import { imageReducer } from "./features/imageSlice";
import { layerReducer } from "./features/layerSlice";

export const rootReducer = combineReducers({
  image: imageReducer,
  layer: layerReducer,
});
