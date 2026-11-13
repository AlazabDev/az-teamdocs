import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./index.css";
import "./base.css";
import "./style-pack.css";

const theme = localStorage.getItem("theme") ?? "system";
if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")!).render(<App />);
