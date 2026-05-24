import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children, roles, requirePayment = true }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Payment Gate for students
  if (requirePayment && user.role === "STUDENT" && !user.isPaid) {
    return <Navigate to="/select-plan" replace />;
  }

  return children;
};

export default ProtectedRoute;
