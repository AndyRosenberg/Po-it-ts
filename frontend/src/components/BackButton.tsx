import { useNavigate } from "react-router-dom";

type BackButtonProps = {
  className?: string;
};

export const BackButton = ({ className = "" }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <button 
      onClick={handleGoBack}
      className={`text-slate-300 hover:text-white transition-colors ${className}`}
      aria-label="Go Back"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
    </button>
  );
};