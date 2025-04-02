import { Toaster } from "react-hot-toast";
import { AppRoutes } from "./AppRoutes";

function App() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-900 via-cyan-950 to-gray-900 overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
      <div className="absolute inset-0 backdrop-blur-[118px] opacity-30">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-orange-500/10 rounded-full filter blur-3xl"></div>
      </div>
      
      {/* Decorative floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-[10%] w-2 h-2 bg-cyan-400/30 rounded-full floating"></div>
        <div className="absolute top-[15%] right-[20%] w-3 h-3 bg-cyan-400/20 rounded-full floating-slow"></div>
        <div className="absolute bottom-[30%] left-[30%] w-1.5 h-1.5 bg-orange-400/30 rounded-full floating"></div>
        <div className="absolute bottom-[15%] right-[25%] w-2.5 h-2.5 bg-orange-400/20 rounded-full floating-slow"></div>
        <div className="absolute top-[40%] left-[5%] w-1 h-1 bg-cyan-300/30 rounded-full floating-slow"></div>
        <div className="absolute top-[35%] right-[7%] w-2 h-2 bg-orange-300/20 rounded-full floating"></div>
        <div className="absolute bottom-[5%] left-[15%] w-1 h-1 bg-white/20 rounded-full floating"></div>
        <div className="absolute top-[60%] right-[15%] w-1 h-1 bg-white/20 rounded-full floating-slow"></div>
      </div>
      
      {/* Main content */}
      <div className="relative flex items-center justify-center h-full w-full" style={{minWidth: "100vw", minHeight: "100vh"}}>
        <div className="w-full h-full flex items-center justify-center px-4 py-8 overflow-y-auto">
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
