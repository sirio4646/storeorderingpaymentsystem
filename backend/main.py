"""WSGI entrypoint placed inside the `backend` package.

This ensures deployment platforms that run the app with the working
directory set to `backend` can import `main` and find the Flask `app`.
"""
from app import app


if __name__ == "__main__":
    # Local debug run for the backend package
    app.run(host="0.0.0.0", port=8080, debug=True)
