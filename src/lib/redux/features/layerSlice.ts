import { LayerType } from "@/lib/types";
import { generateLayer } from "@/lib/utils";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type State = {
  layers: LayerType[];
  activeLayer: LayerType;
  layerComparisonMode: boolean;
  comparedLayers: string[];
};

const initialLayer = generateLayer();

const initialState: State = {
  layers: [initialLayer],
  activeLayer: initialLayer,
  layerComparisonMode: false,
  comparedLayers: [],
};

const layerSlice = createSlice({
  name: "layer",
  initialState,
  reducers: {
    layerAdded(state, action: PayloadAction<LayerType>) {
      state.layers = [...state.layers, action.payload];
    },
    layerUpdated(state, action: PayloadAction<LayerType>) {
      state.layers = state.layers.map((layer) =>
        layer.id === action.payload.id ? action.payload : layer,
      );
    },
    layerRemoved(state, action: PayloadAction<LayerType["id"]>) {
      state.layers = state.layers.filter(
        (layer) => layer.id !== action.payload,
      );
    },
    layersReordered(state, action: PayloadAction<LayerType[]>) {
      state.layers = action.payload;
    },
    activeLayerSet(state, action: PayloadAction<LayerType["id"]>) {
      state.activeLayer =
        state.layers.find((layer) => layer.id === action.payload) ||
        state.layers[0];
    },
    posterUrlUpdated(
      state,
      action: PayloadAction<{
        id: LayerType["id"];
        posterUrl: LayerType["posterUrl"];
      }>,
    ) {
      state.layers = state.layers.map((layer) =>
        layer.id === action.payload.id
          ? { ...layer, posterUrl: action.payload.posterUrl }
          : layer,
      );
    },
    transcriptionUrlUpdated(
      state,
      action: PayloadAction<{
        id: LayerType["id"];
        transcriptionUrl: LayerType["transcriptionUrl"];
      }>,
    ) {
      state.layers = state.layers.map((layer) =>
        layer.id === action.payload.id
          ? { ...layer, transcriptionUrl: action.payload.transcriptionUrl }
          : layer,
      );
    },
    layerComparisonModeToggled(state) {
      state.layerComparisonMode = !state.layerComparisonMode;
    },
    comparedLayersUpdated(state, action: PayloadAction<string[]>) {
      state.comparedLayers = action.payload;
      state.layerComparisonMode = action.payload.length > 0;
    },
    comparedLayersCleared(state) {
      state.comparedLayers = [];
    },
    layerToCompareSelected(state, action: PayloadAction<{ id: string }>) {
      const newComparedLayers = state.comparedLayers.includes(action.payload.id)
        ? state.comparedLayers.filter(
            (layerId) => layerId !== action.payload.id,
          )
        : [...state.comparedLayers, action.payload.id].slice(-2);
      state.comparedLayers = newComparedLayers;
      state.layerComparisonMode = newComparedLayers.length > 0;
    },
  },
});

const { actions, reducer } = layerSlice;

export const {
  layerAdded,
  layerUpdated,
  layerRemoved,
  layersReordered,
  activeLayerSet,
  posterUrlUpdated,
  transcriptionUrlUpdated,
  layerComparisonModeToggled,
  comparedLayersUpdated,
  comparedLayersCleared,
  layerToCompareSelected,
} = actions;

export const layerReducer = reducer;
