import { useNavigate } from "react-router-dom";

export default function DeveloperLink({ userId, className = "", children }) {
  const navigate = useNavigate();

  if (!userId) return <>{children}</>;

  return (
    <span
      role="button"
      tabIndex={0}
      className={`cursor-pointer ${className}`}
      onClick={(e) => {
        e.stopPropagation(); // don't trigger parent card clicks
        navigate(`/developer/${userId}`);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/developer/${userId}`);
        }
      }}
    >
      {children}
    </span>
  );
}