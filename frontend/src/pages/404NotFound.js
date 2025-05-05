import React from "react";
import  "./Pages.css";

const NotFound = () => {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">404 - Page Not Found</h1>
        <p className="error-message">
          Sorry, the page you are looking for does not exist.
        </p>
        <p>
          You can go back to the <a href="/">home page</a> or check out our{" "}
          <a href="/about">About page</a> to learn more about Bartleby.
        </p>
      </div>
    </div>
  );
}
export default NotFound;
