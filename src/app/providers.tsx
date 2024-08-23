"use client";

import { persistor, store } from "../lib/redux/store";
import { Provider } from "react-redux";
import { ReactNode } from "react";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider } from "next-themes";
import Toast from "@/components/ui/Toast";

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toast />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
