import { Link } from "react-router-dom";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import { useState } from "react";
import { useLogin } from "../hooks/useLogin";

export const Login = () => {
	useAuthRedirect("/");

	const [inputs, setInputs] = useState({ username: "", password: "" });
	const { login, loading } = useLogin();

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		login(inputs);
	}

	return (
		<div className='relative bg-white p-8 rounded-lg shadow-lg w-full max-w-md'>
			<div className='w-full p-6 rounded-lg shadow-md bg-gray-800 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
				<h1 className='text-3xl font-semibold text-center text-white'>
					Login
					<span className='text-blue-500'> Po-it</span>
				</h1>

				<form onSubmit={handleSubmit}>
					<div>
						<label className='label py-2'>
							<span className='text-base label-text'>Username</span>
						</label>
						<input type='text' placeholder='Enter username' className='w-full input input-bordered h-10'
						  value={inputs.username} onChange={(e) => setInputs({...inputs, username: e.target.value}) } />
					</div>

					<div>
						<label className='label py-2'>
							<span className='text-base label-text'>Password</span>
						</label>
						<input
							type='password'
							placeholder='Enter Password'
							className='w-full input input-bordered h-10'
							value={inputs.password}
							onChange={(e) => setInputs({...inputs, password: e.target.value}) }
						/>
					</div>
					<Link
						to='/signup'
						className='py-1 text-sm hover:underline text-white mt-2 inline-block'
					>
						Don't have an account?
					</Link>

					<div>
						<button className='btn btn-block btn-sm mt-2' disabled={loading}>
							{ loading ? "Loading..." : "Login" }
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};
