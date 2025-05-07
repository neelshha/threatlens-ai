# ThreatLens AI

ThreatLens AI is a Next.js application that provides advanced threat intelligence and analysis capabilities. Built with modern web technologies and best practices for security analysis.

## Features

- Modern Next.js App Router architecture
- Authentication with NextAuth.js
- Database integration with Prisma
- Real-time data fetching with SWR
- DOCX export capabilities
- Responsive UI with Tailwind CSS
- Markdown rendering support
- Toast notifications for user feedback

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Prisma (Database ORM)
- Tailwind CSS
- NextAuth.js
- SWR (Data fetching)
- Export libraries (docx)

## Getting Started

### Prerequisites

- Node.js v14 or later
- npm or Yarn
- PostgreSQL (or your preferred database)

### Installation

```bash
git clone https://github.com/neelshha/threatlens-ai.git
cd threatlens-ai
npm install
```

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```dotenv
DATABASE_URL="your_database_connection_string"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Database Setup

```bash
npx prisma generate
npx prisma db push
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Available Scripts

```bash
npm run dev     # Start development server
npm run build   # Generate Prisma client and build for production
npm start       # Start production server
npm run lint    # Run code linter
```

## Project Structure

```bash
threatlens-ai/
├── src/              # Source code directory
├── public/           # Static assets
├── prisma/          # Database schema and migrations
├── types/           # TypeScript type definitions
├── components/      # Reusable UI components
├── next.config.ts   # Next.js configuration
├── tailwind.config.js # Tailwind CSS configuration
└── package.json     # Project dependencies and scripts
```

## Deployment

The project is configured for deployment on Vercel:

1. Push your code to a Git repository
2. Import the repository in Vercel
3. Configure environment variables
4. Deploy and enjoy automatic previews

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
