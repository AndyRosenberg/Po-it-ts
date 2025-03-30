import { useAuthRedirect } from "../hooks/useAuthRedirect";

export const Home = () => {
  useAuthRedirect();

	return (
		<div className="max-w-400 mx-auto">
      <div className='justify-center flex h-[90vh] w-full rounded-lg overflow-hidden bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
        Here is Home
      </div>
    </div>
	);
};
export default Home;