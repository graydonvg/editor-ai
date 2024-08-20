"use client";

import { persistor, store } from "../lib/redux/store";
import { Provider } from "react-redux";
import { ReactNode } from "react";
import { PersistGate } from "redux-persist/integration/react";

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
