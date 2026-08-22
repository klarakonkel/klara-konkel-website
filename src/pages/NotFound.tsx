import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-3 tracking-tight">404</h1>
        <p className="text-lg text-muted-foreground mb-6">
          this page wandered off to another country.
        </p>
        <Link to="/" className="ghost-btn">
          ← back home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
