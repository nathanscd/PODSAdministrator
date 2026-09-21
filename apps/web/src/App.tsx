import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

import { ToastProvider } from "./contexts/ToastContext";
import { LangProvider } from "./contexts/LangContext";
import { NotificationListener } from "./components/NotificationListener";
import SmoothScroll from "./components/SmoothScroll";
import GrainEffect from "./components/GrainEffect";
import AppRoutes from "./routes";

function App() {
  useEffect(() => {}, []);

  return (
    <LangProvider>
      <div>
        <ToastProvider>
          <SmoothScroll>
            <NotificationListener />
            <GrainEffect />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </SmoothScroll>
        </ToastProvider>
      </div>
    </LangProvider>
  );
}

export default App;