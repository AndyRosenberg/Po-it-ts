import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import { SignUp } from "./pages/SignUp";
import { Login } from "./pages/Login";
import { CreatePoem } from "./pages/CreatePoem";
import { ViewPoem } from "./pages/ViewPoem";
import { EditPoem } from "./pages/EditPoem";
import { PublicPoems } from "./pages/PublicPoems";

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="/login" element={<Login />} />
    <Route path="/poems/create" element={<CreatePoem />} />
    <Route path="/poems/:poemId" element={<ViewPoem />} />
    <Route path="/poems/:poemId/edit" element={<EditPoem />} />
    <Route path="/explore" element={<PublicPoems />} />
  </Routes>
)