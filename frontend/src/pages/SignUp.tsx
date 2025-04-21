import { Link } from "react-router-dom";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import { useState } from "react";
import { useSignup } from "../hooks/useSignup";

export const SignUp = () => {
  useAuthRedirect("/");

  const { loading, signup } = useSignup();

  const [inputs, setInputs] = useState({
    email: "", username: "", password: "", confirmPassword: "",
  });

  const handleSubmitForm = (event: React.FormEvent) => {
    event.preventDefault();
    signup(inputs);
  }

  return (
    <div className="w-full h-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start px-4 py-12">
      {/* Signup Form */}
      <div className="w-full max-w-md mx-auto h-full flex items-center">
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-cyan-500/20 shadow-xl overflow-hidden w-full">
          <div className="px-8 pt-8 pb-6">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-1">
							Create account
              </h1>
              <div className="text-xl">
                <span className="text-slate-300">with</span>
                <span className="bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent font-bold"> Po-it</span>
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium pl-1">
								Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="someone@example.com"
                    className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder:text-slate-500"
                    value={inputs.email}
                    onChange={(e) => setInputs({...inputs, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium pl-1">
								Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="johndoe"
                    className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder:text-slate-500"
                    value={inputs.username}
                    onChange={(e) => setInputs({...inputs, username: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium pl-1">
								Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Create a password"
                    className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder:text-slate-500"
                    value={inputs.password}
                    onChange={(e) => setInputs({...inputs, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium pl-1">
								Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder:text-slate-500"
                    value={inputs.confirmPassword}
                    onChange={(e) => setInputs({...inputs, confirmPassword: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  to="/login"
                  className="text-sm text-slate-300 hover:text-cyan-400 transition-colors"
                >
								Already have an account?
                </Link>
              </div>

              <button
                className="w-full h-11 bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 text-white font-medium rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/40 hover:translate-y-[-1px] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
                disabled={loading}
              >
                {loading ?
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
									Loading...
                  </span> :
                  "Create account"
                }
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Example Poem */}
      <div className="hidden md:block w-full max-w-md mx-auto h-full flex items-center content-center">
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-cyan-500/20 shadow-xl overflow-hidden p-8 relative w-full">
          <div className="absolute top-4 right-4 text-orange-400/30">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 opacity-50">
              <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
              <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
              <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">City Lights</h3>
          <div className="space-y-4 text-slate-200 italic">
            <p>
							Street lamps flicker in the rain,<br/>
							Neon signs reflect the pain<br/>
							Of empty streets and whispered dreams,<br/>
							The city's never what it seems.
            </p>
            <p>
							Skyscrapers touch the clouded sky,<br/>
							A thousand stories passing by.<br/>
							In windows bright with urban glow,<br/>
							Lives intersect, then onward flow.
            </p>
          </div>
          <div className="mt-6 flex items-center">
            <div className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 text-xs font-medium">JL</div>
            <div className="ml-3">
              <p className="text-sm text-slate-300">Jake Liu</p>
              <p className="text-xs text-slate-400">Shared yesterday</p>
            </div>
            <div className="ml-auto flex items-center text-slate-400 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
							42
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};