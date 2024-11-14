import { AppProps } from "next/app";
import "../styles/globals.css";
import { LectureProvider } from "@/contexts/LectureContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LectureProvider>
      <Component {...pageProps} />
    </LectureProvider>
  );
}

export default MyApp;
