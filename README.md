# Thikana

Thikana (ঠিকানা — Bangla for “address”) is a full-stack real-estate platform for the Bangladeshi market. Members add properties privately, publish them as **Rent** or **Sell** posts, browse other members’ published posts, view full details and photo galleries, and communicate with owners in real time.

## Features

- JWT-based registration, login, profile editing, and protected frontend routes
- Property management: create, edit, and delete properties; upload up to 10 Cloudinary images
- Dedicated property editing page with editable details, per-image deletion, and add-image controls capped at 10 images
- City selection uses a shared list of 20 major Bangladeshi cities in the property form and Explore filters
- Publish workflow: a property appears publicly only after its owner posts it for rent or sale
- Explore feed that displays published posts only
- Property-name search is available above the Explore filters
- Full property-details pages with description, listing facts, owner details, and every uploaded image
- Real-time messaging through Socket.IO, with MySQL-backed history and read status
- Navbar message icon shows the total unread message count
- Message threads stay on the latest message unless the user scrolls up to read older history
- A down-arrow control lets users jump back to the latest message
- Property-card actions for details, messaging an owner, posting, editing, and deleting
- Published cards in My Properties show posting status prominently, with details available in the secondary actions
- Responsive app shell with a full-width navbar and centered mobile navigation

## Tech Stack

| Area | Technology |
|---|---|
| Frontend | React 19, React Router v7, Vite, Sass, Socket.IO Client |
| Backend | Node.js, Express, Socket.IO |
| Data | MySQL via `mysql2` |
| Authentication | JWT and `bcryptjs` |
| Media | Multer and Cloudinary |

## Project Structure

```text
Project - Thikana/
├── Thikana_Backend/
│   ├── app.js                 # Express and Socket.IO entry point
│   └── src/
│       ├── config/            # Database, Cloudinary, and upload setup
│       ├── controllers/       # HTTP request handlers
│       ├── middleware/        # Shared JWT authentication middleware
│       ├── services/          # Business logic
│       ├── models/            # Data model modules
│       ├── queries/           # SQL queries and table definitions
│       ├── routes/            # REST routes
│       ├── socket.js          # Authenticated Socket.IO events
│       └── utils/             # Database, auth, Cloudinary helpers
└── Thikana_Frontend/
    └── src/
        ├── components/        # Cards, navbar, message panel, etc.
        ├── context/           # Auth and Socket providers
        └── pages/             # App pages, including PropertyDetails
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- MySQL
- A Cloudinary account

### Backend

```bash
cd Thikana_Backend
npm install
npm start
```

The backend creates its MySQL tables when it starts.

### Frontend

```bash
cd Thikana_Frontend
npm install
npm run dev
```

The Vite development URL is normally `http://localhost:5173`.

## Environment Variables

Create `Thikana_Backend/.env`:

```env
PORT=4000
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=thikana

JWT_SECRET=replace_with_a_long_random_secret

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

Create `Thikana_Frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

When deploying, set `CLIENT_URL` to the frontend origin and configure the two `VITE_*` variables with the deployed backend URL. Use HTTPS/WSS in production.

The frontend validates the JWT expiry when it starts. Expired or malformed tokens are removed from local storage and the user is returned to `/`. Authenticated HTTP 401 responses and Socket.IO authentication failures also clear the session.

## Main Workflow

1. A user creates a property in **My Properties**. It is private at this stage.
2. The user clicks **Post**, chooses **Rent** or **Sell**, then confirms.
3. The property becomes a public post shown to other members in Explore.
4. A viewer can select **See details** to view all details and photos, or **Message owner** to start a live conversation.

## API Overview

All routes are prefixed with `/api`. Routes marked as authenticated require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/auth/register-user` | Register | No |
| POST | `/auth/login-user` | Login and receive JWT | No |
| GET | `/user/get-user-data` | Current user profile | Yes |
| PUT | `/user/edit-profile` | Update profile | Yes |
| PUT | `/user/update-profile-picture` | Upload profile picture | Yes |
| PUT | `/user/change-password` | Change password | Yes |
| POST | `/property/register-property` | Add a property and images | Yes |
| GET | `/property/user-properties` | Current user’s properties and post status | Yes |
| PUT | `/property/update-property/:propertyId` | Edit a property | Yes |
| DELETE | `/property/delete-property/:propertyId` | Delete a property | Yes |
| POST | `/property/add-new-images/:propertyId` | Add property images | Yes |
| DELETE | `/property/delete-images/:propertyId` | Delete property images | Yes |
| POST | `/image/upload-image` | Upload a generic image | Yes |
| POST | `/image/upload-multiple-images` | Upload multiple generic images | Yes |
| DELETE | `/image/delete-image` | Delete an owned property image by Cloudinary public ID | Yes |
| GET | `/property/properties/:propertyId` | Complete property details and gallery | No |
| POST | `/post/create-post/:propertyId` | Publish as `rent` or `sell` | Yes |
| GET | `/post/posts` | Published-post feed | No |
| DELETE | `/post/delete-post/:postId` | Remove a post | Yes |
| GET | `/messages/conversations` | Conversation summaries | Yes |
| GET | `/messages/conversations/:otherUserId` | Conversation history | Yes |
| PATCH | `/messages/conversations/:otherUserId/read` | Mark a conversation read | Yes |

Conversation history returns the newest page first and supports a `before` message-ID cursor for loading older messages. Each returned page remains chronological for display.

## Socket.IO Events

The frontend connects with the JWT in `auth.token`. The server verifies it and assigns the socket to `user:<userId>`.

| Direction | Event | Payload |
|---|---|---|
| Client → Server | `message:send` | `receiverId`, optional `postId`, `text` |
| Server → Client | `message:new` | Persisted message object |
| Client → Server | `message:read` | `otherUserId` |
| Server → Client | `message:read` | Reader information, emitted to both participants |

## Database Tables

- `Users`
- `Properties`
- `Posts`
- `Property_Images`
- `Messages`

## Verification

Build the frontend before deployment:

```bash
cd Thikana_Frontend
npm run build
```

## Roadmap

- Add post unpublishing and post editing
- Add search and more complete Explore filters
- Add automated tests and OpenAPI documentation
- Add a shared Socket.IO adapter such as Redis when scaling the backend beyond one process
