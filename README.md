# Thikana

![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=20232A)
![Vite 6](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express 4](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)
![Socket.IO 4](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)
![Sass](https://img.shields.io/badge/Sass-SCSS-CC6699?logo=sass&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-media-3448C5?logo=cloudinary&logoColor=white)

Thikana (ঠিকানা — Bangla for “address”) is a full-stack real-estate platform for the Bangladeshi market. Members add properties privately, publish them as **Rent** or **Sell** posts, browse other members’ published posts, view full details and photo galleries, and communicate with owners in real time.

## Features

- Secure user authentication with profile management and protected application routes
- Property creation and management with Cloudinary image storage
- Private property listings that can be published for rent or sale
- Published-property discovery with search and location/type filters
- Detailed property pages with listing information, owner details, and image galleries
- Real-time user messaging with persistent history, read status, unread indicators, and property references attached to relevant messages
- Persistent light and dark themes with a Navbar mode switch
- Responsive application interface for desktop and mobile users

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
