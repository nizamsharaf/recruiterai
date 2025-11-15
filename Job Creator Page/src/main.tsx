
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.tsx";
import { PublicJobPage } from "./pages/PublicJobPage";
import { ApplyPage } from "./pages/ApplyPage";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/job/:publicLink" element={<PublicJobPage />} />
      <Route path="/job/:publicLink/apply" element={<ApplyPage />} />
      <Route path="/*" element={<App />} />
    </Routes>
  </BrowserRouter>
);
  