import { Toaster } from "react-hot-toast";
import { AppRoutes } from "./AppRoutes";

function App() {
  return (
    <div className="fixed inset-0 w-screen h-screen min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-gray-900 overflow-hidden">
      {/* Background patterns - simplified */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full"></div>
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-orange-500/10 rounded-full"></div>
      </div>
      
      {/* Decorative static elements - removed animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-[10%] w-2 h-2 bg-cyan-400/30 rounded-full"></div>
        <div className="absolute top-[15%] right-[20%] w-3 h-3 bg-cyan-400/20 rounded-full"></div>
        <div className="absolute bottom-[30%] left-[30%] w-1.5 h-1.5 bg-orange-400/30 rounded-full"></div>
        <div className="absolute bottom-[15%] right-[25%] w-2.5 h-2.5 bg-orange-400/20 rounded-full"></div>
      </div>
      
      {/* Main content */}
      <div className="relative w-full h-full overflow-auto">
        <div className="w-full h-full flex justify-center">
          <AppRoutes />
        </div>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--dark)',
              color: 'var(--light)',
              border: '1px solid var(--primary-light)',
              boxShadow: '0 4px 12px rgba(8, 145, 178, 0.15)',
            },
          }}
        />
      </div>
    </div>
  )
}

export default App
