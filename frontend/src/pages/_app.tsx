import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import {initializeStore} from "@/store";
import {Provider} from "react-redux";
import {useEffect, useState} from "react";
import {Store} from "redux";

export default function App({ Component, pageProps }: AppProps) {
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    const initStore = async () => {
      const initializedStore = await initializeStore();
      setStore(initializedStore);
    };

    initStore();
  }, []);

  if (!store) {
    return <div>Loading...</div>;
  }

  return (
    <Provider store={store}>
      <div data-theme="pastel">
        <Component {...pageProps} />
      </div>
    </Provider>
  )
}
