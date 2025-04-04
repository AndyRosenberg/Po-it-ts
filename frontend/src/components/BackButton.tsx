import { useNavigate } from "react-router-dom";

type BackButtonProps = {
  className?: string;
};

export const BackButton = ({ className = "" }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Check if history exists and is not an edit page
    if (window.history.state && window.history.state.idx > 0) {
      const prevPath = window.history.state.usr?.pathname || "";
      // If previous page was an edit page, go home
      if (prevPath.includes("/edit") || prevPath.includes("/create")) {
        navigate("/");
      } else {
        navigate(-1); // Normal back behavior
      }
    } else {
      // If no history or at the start of history, go home
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