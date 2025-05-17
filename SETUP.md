# Development Environment Setup

Before you can run the Open Language Platform, you need to set up your development environment. Follow these steps:

1. Install Node.js and npm
   - Download and install Node.js from [https://nodejs.org/](https://nodejs.org/)
   - Choose the LTS (Long Term Support) version
   - The installation will include npm (Node Package Manager)

2. Install MongoDB
   - Download MongoDB Community Server from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Follow the installation instructions for your operating system
   - Start the MongoDB service

3. Set up the environment variables
   Create a `.env` file in the root directory with the following content:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/language-platform
   JWT_SECRET=your-super-secret-key-change-this-in-production
   ```

4. Install project dependencies
   Once Node.js and npm are installed, run these commands:
   ```bash
   # Install server dependencies
   npm install

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

5. Start the development servers
   ```bash
   # Start both server and client
   npm run dev:full

   # Or start them separately:
   # Terminal 1 - Start the server
   npm run dev

   # Terminal 2 - Start the client
   npm run client
   ```

## Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running on your system
- Check if the MongoDB URI in your `.env` file matches your MongoDB configuration
- Default MongoDB port is 27017

### Port Conflicts
- If port 5000 is already in use, change the PORT in your `.env` file
- React development server runs on port 3000 by default

### Node.js/npm Issues
- Make sure Node.js and npm are properly installed by running:
  ```bash
  node --version
  npm --version
  ```
- If you get "command not found" errors, try reinstalling Node.js

For any other issues, please check the project's GitHub issues page or create a new issue. 