import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? null;

setBaseUrl(apiBaseUrl);

createRoot(document.getElementById("root")!).render(<App />);
