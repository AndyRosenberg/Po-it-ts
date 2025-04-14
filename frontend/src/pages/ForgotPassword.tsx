import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import { useForgotPassword } from "../hooks/useForgotPassword";
import { BackButton } from "../components/BackButton";

export const ForgotPassword = () => {
  useAuthRedirect("/");

  const [email, setEmail] = useState("");
  const { forgotPassword, loading, isSuccess } = useForgotPassword();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    forgotPassword({ email });
  };

  return (
    <div className="w-full h-full max-w-md mx-auto px-4 py-12 flex flex-col items-center">
      <BackButton />
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-cyan-500/20 shadow-xl overflow-hidden w-full mt-4">
        <div className="px-8 pt-8 pb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-1">Forgot Password</h1>
            <p className="text-slate-300">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>

          {isSuccess ? (
            <div className="text-center p-4">
              <div className="bg-cyan-500/10 rounded-lg p-4 mb-4 border border-cyan-500/20">
                <p className="text-cyan-300">
                  If an account with that email exists, we've sent a password reset link.
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  Please check your email and follow the instructions.
                </p>
              </div>
              <Link
                to="/login"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Return to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium pl-1">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder:text-slate-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/login"
                  className="text-sm text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  Remember your password?
                </Link>
              </div>

              <button
                className="w-full h-11 bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 text-white font-medium rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/40 hover:translate-y-[-1px] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};