import React from "react";
import { Navigate, Link } from "react-router-dom";
import pageNotFound from "../../assets/page-not-found.svg"

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center text-center px-4">
      <img src={pageNotFound}/>
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mt-4">
        404 - Page Not Found
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6 max-w-md">
        Sorry, the page you are looking for is not available or has been moved.
      </p>

      <Link to="/">
        <button
          className="bg-green-600 cursor-pointer hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-300"
        >
          Back to Home
        </button>
      </Link>
    </div>
  );
};

export default NotFound;
