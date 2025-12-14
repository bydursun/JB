import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page not found</h1>
        <p className="text-gray-600 mb-6">
          The page you are looking for doesn’t exist or may have moved.
        </p>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Go home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
