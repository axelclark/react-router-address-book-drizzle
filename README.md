# React Router Address Book

A modern, full-stack address book application built with React Router 7, TypeScript, and PostgreSQL. Features server-side rendering, real-time search, and a clean, responsive interface.

## Features

- 📇 **Contact Management** - Create, read, update, and delete contacts
- 🔍 **Real-time Search** - Instant filtering of contacts as you type
- ⭐ **Favorites** - Mark contacts as favorites for quick access
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 🚀 **Server-Side Rendering** - Fast initial loads and SEO-friendly
- 🔒 **Type-Safe** - Full TypeScript coverage with strict mode
- 🗄️ **PostgreSQL Database** - Reliable data storage with Drizzle ORM
- 🧪 **Comprehensive Testing** - Unit, integration, and E2E tests

## Tech Stack

- **Frontend**: React 19, React Router 7, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express 5, PostgreSQL, Drizzle ORM
- **Build**: Vite 6
- **Testing**: Vitest, Playwright, React Testing Library

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd react-router-address-book-drizzle
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create a .env file with your database connection
echo "DATABASE_URL=postgresql://user:password@localhost:5432/address_book" > .env
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. (Optional) Seed the database with sample data:
```bash
npm run db:seed
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Database Management

```bash
# Run migrations
npm run db:migrate

# Generate new migrations after schema changes
npm run db:generate

# Seed database with sample data
npm run db:seed

# Open Drizzle Studio for database visualization
npm run db:studio
```

## Testing

```bash
# Run all tests
npm test

# Run unit and integration tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui
```

## Building for Production

```bash
# Build the application
npm run build

# Preview production build locally
npm run start
```

## Project Structure

```
/app
  /actions        - Server actions for data mutations
  /layouts        - Layout components (sidebar)
  /routes         - Route components (pages)
  /root.tsx       - Root application component
  /routes.ts      - Route configuration

/database
  /context.ts     - Database context using AsyncLocalStorage
  /schema.ts      - Drizzle ORM schema definitions
  /seed.ts        - Database seeding script

/server
  /app.ts         - Express server configuration

/tests
  /unit           - Unit tests for components
  /integration    - Integration tests for actions
  /e2e            - End-to-end tests with Playwright
```

## API Routes

- `GET /` - Home page with contact list
- `GET /contacts/:contactId` - View specific contact
- `GET /contacts/:contactId/edit` - Edit contact form
- `POST /contacts/:contactId/edit` - Update contact
- `POST /contacts/:contactId/destroy` - Delete contact
- `GET /about` - About page

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## Docker Support

Build and run with Docker:

```bash
# Build image
docker build -t address-book .

# Run container
docker run -p 3000:3000 -e DATABASE_URL="your-db-url" address-book
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).