// src/pages/NotFound.jsx
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      <h1 className="text-9xl font-extrabold text-blue-600">404</h1>
      <h2 className="mt-4 text-2xl md:text-3xl font-bold text-gray-800">
        Oops! Page not found.
      </h2>
      <p className="mt-2 text-gray-600 text-center max-w-md">
        The page you are looking for doesn’t exist or has been moved.
      </p>

      <div className="mt-6">
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
