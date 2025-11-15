#!/bin/bash

# A script to make local testing easy.
# It generates the contributions file and then starts a local server.

echo "--- Local Development Server ---"

# 1. Check for GH_TOKEN
if [ -z "$GH_TOKEN" ]; then
    echo "ERROR: The GH_TOKEN environment variable is not set."
    echo "Please set it before running this script:"
    echo "export GH_TOKEN=your_personal_access_token"
    echo "Or run the script like this:"
    echo "GH_TOKEN=your_personal_access_token ./test-locally.sh"
    exit 1
fi

# 2. Install Node.js dependencies if they are missing
if [ ! -d "node_modules" ]; then
    echo "Node modules not found. Running 'npm install'..."
    npm install
    if [ $? -ne 0 ]; then
        echo "npm install failed. Please check for errors."
        exit 1
    fi
fi

# 3. Run the script to fetch contributions
echo "Fetching GitHub contribution data..."
node index.js
if [ $? -ne 0 ]; then
    echo "Failed to fetch contribution data. Please check your GH_TOKEN and network connection."
    exit 1
fi
echo "Successfully created contributions.json."

# 4. Start the local server
PORT=8000
echo "Starting local server at http://localhost:$PORT"
echo "Press Ctrl+C to stop the server."

# Check for Python 3 or Python 2
if command -v python3 &>/dev/null; then
    python3 -m http.server $PORT
elif command -v python &>/dev/null; then
    python -m SimpleHTTPServer $PORT
else
    echo "Error: Could not find Python to start a local server."
    echo "Please install Python 3 to use this script."
    exit 1
fi
