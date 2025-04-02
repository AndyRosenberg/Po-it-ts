import { Link } from "react-router-dom";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import { useState } from "react";
import { useLogin } from "../hooks/useLogin";

export const Login = () => {
	useAuthRedirect("/");

	const [inputs, setInputs] = useState({ usernameOrEmail: "", password: "" });
	const { login, loading } = useLogin();

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		login(inputs);
	}

	return (
		<div className="w-full h-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start px-4 py-12">
			{/* Login Form */}
			<div className="w-full max-w-md mx-auto h-full flex items-center">
				<div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-cyan-500/20 shadow-xl overflow-hidden w-full">
					<div className="px-8 pt-8 pb-6">
					<div className="text-center mb-6">
						<h1 className="text-3xl font-bold mb-1">
							Welcome back
						</h1>
						<div className="text-xl">
							<span className="text-slate-300">to</span>
							<span className="bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent font-bold"> Po-it</span>
						</div>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div className="space-y-2">
							<label className="block text-sm font-medium pl-1">
								Username or Email
							</label>
							<div className="relative">
								<input 
									type="text" 
									placeholder="Enter username or email" 
									className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder:text-slate-500"
									value={inputs.usernameOrEmail} 
									onChange={(e) => setInputs({...inputs, usernameOrEmail: e.target.value})} 
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
									placeholder="Enter password"
									className="w-full h-11 px-4 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder:text-slate-500"
									value={inputs.password}
									onChange={(e) => setInputs({...inputs, password: e.target.value})}
								/>
							</div>
						</div>

						<div className="flex items-center justify-between">
							<Link
								to="/signup"
								className="text-sm text-slate-300 hover:text-cyan-400 transition-colors"
							>
								Don't have an account?
							</Link>
							<Link
								to="/forgot-password"
								className="text-sm text-slate-300 hover:text-cyan-400 transition-colors"
							>
								Forgot password?
							</Link>
						</div>

						<button 
							className="w-full h-11 bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 text-white font-medium rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/40 hover:translate-y-[-1px] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0" 
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
								"Sign in"
							}
						</button>
					</form>
					</div>
				</div>
			</div>
			
			{/* Example Poem */}
			<div className="hidden md:block w-full max-w-md mx-auto h-full flex items-center content-center">
				<div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-cyan-500/20 shadow-xl overflow-hidden p-8 relative w-full">
					<div className="absolute top-4 right-4 text-cyan-400/30">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 opacity-50">
							<path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
						</svg>
					</div>
					<h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">From the Ocean</h3>
					<div className="space-y-4 text-slate-200 italic">
						<p>
							Waves crash upon the distant shore,<br/>
							Echoes of time, forevermore.<br/>
							Beneath the surface, secrets deep,<br/>
							Stories that the oceans keep.
						</p>
						<p>
							Teal horizons touch the sky,<br/>
							Seagulls' distant, haunting cry.<br/>
							Salt and wind upon my face,<br/>
							Nature's wild, untamed grace.
						</p>
					</div>
					<div className="mt-6 flex items-center">
						<div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-300 text-xs font-medium">MM</div>
						<div className="ml-3">
							<p className="text-sm text-slate-300">Mia Morgan</p>
							<p className="text-xs text-slate-400">Shared 2 days ago</p>
						</div>
						<div className="ml-auto flex items-center text-slate-400 text-sm">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
								<path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
							</svg>
							36
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};