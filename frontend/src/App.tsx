import { Toaster } from "react-hot-toast";
import { AppRoutes } from "./AppRoutes";

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100" style={{width: "100vw"}}>
      <div className="absolute inset-0 bg-gray-900 opacity-50" />
      <AppRoutes />
      <Toaster />
    </div>
  )
}

export default App
