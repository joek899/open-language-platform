# Open Language Platform

An open-source platform for language contributions and dictionary functionality. This platform allows users to contribute to different languages, add translations, and use it as a comprehensive dictionary.

## Features

- User authentication and authorization
- Language contribution system
- Dictionary functionality for multiple languages
- Search and filter capabilities
- User contribution tracking
- Community voting and moderation

## Tech Stack

- Frontend: React.js with TypeScript
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: JWT

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/open-language-platform.git
cd open-language-platform
```

2. Install dependencies
```bash
npm run install:all
```

3. Create a .env file in the root directory and add your environment variables
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Start the development servers
```bash
npm run dev:full
```

## Contributing

We welcome contributions from the community! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 