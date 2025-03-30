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
		<div className='relative bg-white p-8 rounded-lg shadow-lg w-full max-w-md'>
			<div className='w-full p-6 rounded-lg shadow-md bg-gray-800 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
				<h1 className='text-3xl font-semibold text-center text-gray-300'>
					Sign Up <span className='text-blue-500'> Po-it</span>
				</h1>

				<form onSubmit={handleSubmitForm}>
					<div className="py-1">
						<label className='label py-2'>
							<span className='text-base label-text text-white'>Email</span>
						</label>
						<input type='email' placeholder='someone@google.com' className='w-full input input-bordered  h-10'
						  value={inputs.email} onChange={(e) => setInputs({...inputs, email: e.target.value}) } />
					</div>

					<div className="py-1">
						<label className='label py-2 '>
							<span className='text-base label-text text-white'>Username</span>
						</label>
						<input type='text' placeholder='johndoe' className='w-full input input-bordered h-10'
						  value={inputs.username} onChange={(e) => setInputs({...inputs, username: e.target.value}) } />
					</div>

					<div className="py-1">
						<label className='label py-2'>
							<span className='text-base label-text text-white'>Password</span>
						</label>
						<input
							type='password'
							placeholder='Enter Password'
							className='w-full input input-bordered h-10'
							value={inputs.password} onChange={(e) => setInputs({...inputs, password: e.target.value}) }
						/>
					</div>

					<div className="py-1">
						<label className='label py-2'>
							<span className='text-base label-text text-white'>Confirm Password</span>
						</label>
						<input
							type='password'
							placeholder='Confirm Password'
							className='w-full input input-bordered h-10'
							value={inputs.confirmPassword} onChange={(e) => setInputs({...inputs, confirmPassword: e.target.value}) }
						/>
					</div>

					<Link
						to={"/login"}
						className='text-sm hover:underline hover:text-blue-600 mt-2 inline-block text-white'
					>
						Already have an account?
					</Link>

					<div>
						<button className='btn btn-block btn-sm mt-2 border border-slate-700' disabled={loading}>
							{ loading ? "Loading..." : "Sign Up" }
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};
