import React from "react";
import ReactDOM from "react-dom/client";
import "@repere/ui/tokens.css";
import "./styles/app.css";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);

/* Le service worker s'enregistre APRÈS le premier rendu : l'installation ne doit
   jamais retarder ce que le lecteur est venu voir. */
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* Sans service worker l'application marche encore, elle perd seulement le
         hors-ligne. On ne montre rien : ce n'est pas le problème du lecteur. */
    });
  });
}
