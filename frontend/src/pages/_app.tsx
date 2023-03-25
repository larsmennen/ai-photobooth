import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import {initializeStore, store} from "@/store";
import {Provider} from "react-redux";
import {useEffect, useState} from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [store, setStore] = useState(null);

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
