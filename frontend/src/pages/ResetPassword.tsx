import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useResetPassword } from "../hooks/useResetPassword";
import { BackButton } from "../components/BackButton";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  const [inputs, setInputs] = useState({
    password: "",
    confirmPassword: "",
  });

  const { resetPassword, loading, isSuccess } = useResetPassword();

  useEffect(() => {
    if (!token) {
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (isSuccess) {
      // Redirect to login after 3 seconds
      const timer = setTimeout(() => {
        navigate("/login");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (token) {
      resetPassword({
        token,
        password: inputs.password,
        confirmPassword: inputs.confirmPassword,
      });
    }
  };

  return (
    <div className="w-full h-full max-w-md mx-auto px-4 py-12 flex flex-col items-center">
      <BackButton />
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-cyan-500/20 shadow-xl overflow-hidden w-full mt-4">
        <div className="px-8 pt-8 pb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-1">Reset Password</h1>
            <p className="text-slate-300">Create a new password for your account</p>
          </div>

          {isSuccess ? (
            <div className="text-center p-4">
              <div className="bg-cyan-500/10 rounded-lg p-4 mb-4 border border-cyan-500/20">
                <p className="text-cyan-300">Your password has been reset successfully!</p>
                <p className="text-slate-400 text-sm mt-2">
                  You'll be redirected to the login page in a moment...
                </p>
              </div>
              <Link
                to="/login"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Go to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium pl-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder:text-slate-500"
                    value={inputs.password}
                    onChange={(e) =>
                      setInputs({ ...inputs, password: e.target.value })
                    }
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium pl-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder:text-slate-500"
                    value={inputs.confirmPassword}
                    onChange={(e) =>
                      setInputs({ ...inputs, confirmPassword: e.target.value })
                    }
                    required
                    minLength={6}
                  />
                </div>
                {inputs.password && inputs.confirmPassword && inputs.password !== inputs.confirmPassword && (
                  <p className="text-red-400 text-sm pl-1 mt-1">
                    Passwords don't match
                  </p>
                )}
              </div>

              <button
                className="w-full h-11 bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 text-white font-medium rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/40 hover:translate-y-[-1px] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                disabled={loading || (inputs.password !== inputs.confirmPassword) || !inputs.password}
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
                    Resetting...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};