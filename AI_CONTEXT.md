# Thikana: AI Agent Context

> Compact, implementation-oriented context for AI agents modifying this repository. Prefer source code over this document when they disagree. Do not expose secrets from `.env` files.

## Project Identity

Thikana is a React + Express real-estate marketplace for Bangladesh. Users create private properties, attach Cloudinary images, publish each property once as `rent` or `sell`, browse published posts, view details, and message owners in real time.

Repository root: `Project - Thikana/`

- `Thikana_Backend/`: Node.js/Express/Socket.IO API and MySQL access.
- `Thikana_Frontend/`: React/Vite client.
- `README.md`: human-facing setup and feature overview.
- `AI_CONTEXT.md`: this agent-oriented reference.

## Runtime Topology

```text
Browser (Vite/React)
  HTTP JSON + Bearer JWT -> Express API -> services/utils -> MySQL
  HTTP multipart --------> Express + Multer -> Cloudinary + MySQL
  Socket.IO + JWT --------> Socket.IO server -> message service -> MySQL
```

Backend entry point: `Thikana_Backend/app.js`

1. `dotenv` loads environment variables.
2. Express and an HTTP server are created.
3. CORS is configured from `CLIENT_URL`.
4. JSON parsing is enabled.
5. REST routers are mounted under `/api/*`.
6. Socket.IO is attached to the same HTTP server.
7. Database connectivity is checked and tables are created inside the `listen` callback.

Frontend entry point: `Thikana_Frontend/src/main.jsx`

```text
StrictMode
  BrowserRouter
    AuthProvider
      SocketProvider
        App
```

## Backend Architecture

Request path:

```text
route -> controller -> service -> utility/query -> MySQL
```

Directories:

- `src/config/`: `db.js`, Cloudinary setup, Multer setup.
- `src/middleware/`: shared JWT authentication middleware (`authMiddleware.js`).
- `src/routes/`: route declarations only.
- `src/controllers/`: request parsing, token extraction, HTTP response mapping.
- `src/services/`: business rules and ownership checks.
- `src/utils/`: database, auth, Cloudinary, property, post, and user operations.
- `src/queries/`: SQL strings and table creation SQL.
- `src/models/`: `userModel.js`, `propertyModel.js`.
- `src/socket.js`: JWT-authenticated Socket.IO handlers.

Route-level JWT authentication is centralized in `src/middleware/authMiddleware.js`; it validates the Bearer token and attaches the decoded payload to `req.user`. Existing controllers/services still extract the raw token and call `getUserFromToken`, so both layers currently run during the migration. There is no global error middleware.

## Database Schema

Schema creation source: `Thikana_Backend/src/queries/createTableQueries.js`.

### `Users`

- `user_id INT AUTO_INCREMENT PRIMARY KEY`
- `name VARCHAR(255) NOT NULL`
- `email VARCHAR(255) NOT NULL UNIQUE`
- `phone_number VARCHAR(20)`
- `password VARCHAR(255) NOT NULL` (bcrypt hash)
- `address TEXT`
- `profile_picture_url VARCHAR(512)`
- `profile_picture_cloudinary_id VARCHAR(255)`

### `Properties`

- `property_id INT AUTO_INCREMENT PRIMARY KEY`
- `user_id INT -> Users.user_id ON DELETE CASCADE`
- `title VARCHAR(255) NOT NULL`
- `address TEXT NOT NULL`
- `city VARCHAR(100)`
- `price DECIMAL(15,2)`
- `type ENUM('flat','house','commercial') NOT NULL`
- `description TEXT`

### `Posts`

- `post_id INT AUTO_INCREMENT PRIMARY KEY`
- `property_id INT -> Properties.property_id ON DELETE CASCADE`
- `user_id INT -> Users.user_id ON DELETE CASCADE`
- `post_type ENUM('sell','rent') NOT NULL`
- `created_at TIMESTAMP`
- `updated_at TIMESTAMP`

A property is private until a related `Posts` row exists. The service prevents a second post, but the schema has no unique constraint on `property_id`.

### `Property_Images`

- `image_id INT AUTO_INCREMENT PRIMARY KEY`
- `property_id INT -> Properties.property_id ON DELETE CASCADE`
- `image_url VARCHAR(512)`
- `cloudinary_public_id VARCHAR(255)`

### `Messages`

- `message_id INT AUTO_INCREMENT PRIMARY KEY`
- `sender_id INT -> Users.user_id ON DELETE CASCADE`
- `receiver_id INT -> Users.user_id ON DELETE CASCADE`
- `post_id INT -> Posts.post_id ON DELETE CASCADE` (nullable)
- `message_text TEXT`
- `sent_at TIMESTAMP`
- `read_status ENUM('unread','read','delivered') DEFAULT 'unread'`
- `message_type ENUM('text','image','file') DEFAULT 'text'`
- `deleted_by_sender BOOLEAN DEFAULT FALSE`
- `deleted_by_receiver BOOLEAN DEFAULT FALSE`
- `is_edited BOOLEAN DEFAULT FALSE`

There are no migrations or schema-versioning scripts. Existing tables are not altered by startup `CREATE TABLE IF NOT EXISTS` statements.

## REST API Contract

All endpoints are prefixed with `/api`. Authenticated endpoints expect `Authorization: Bearer <JWT>`.

### Authentication

- `POST /auth/register-user`: register from JSON form; returns registration result.
- `POST /auth/login-user`: login with `{ email, password }`; returns JWT.
- `GET /user/get-user-data`: current user profile.
- `PUT /user/edit-profile`: update profile fields.
- `PUT /user/update-profile-picture`: authenticated multipart upload, field `file`.
- `PUT /user/change-password`: authenticated password change.

### Properties and Images

- `POST /property/register-property`: authenticated multipart form; fields `title`, `address`, `city`, `price`, `type`, `description`; files field `files`, maximum 10. Uploads to Cloudinary, inserts property, then image rows.
- `GET /property/user-properties`: authenticated current user properties with post status and aggregated images.
- `PUT /property/update-property/:propertyId`: authenticated owner-only JSON update.
- `DELETE /property/delete-property/:propertyId`: authenticated owner-only delete; attempts Cloudinary cleanup before DB deletion.
- `POST /property/add-new-images/:propertyId`: authenticated owner-only multipart image addition, maximum total 10.
- `DELETE /property/delete-images/:propertyId`: authenticated owner-only image deletion.
- `GET /property/properties`: public all-property query; not used by the current main frontend flow.
- `GET /property/properties/:propertyId`: public property detail query with owner/post/images.

Generic `DELETE /image/delete-image` is authenticated and only deletes a Cloudinary public ID when it belongs to a `Property_Images` row linked to a property owned by the JWT user. It also removes that database row after Cloudinary deletion. Generic uploads are not persisted as property images and therefore cannot be deleted through this endpoint.

### Posts

- `POST /post/create-post/:propertyId`: authenticated owner-only JSON `{ postType: 'rent'|'sell' }`; rejects already-posted properties.
- `DELETE /post/delete-post/:postId`: authenticated post-owner delete.
- `GET /post/posts`: public published-post feed; Home and Explore use this endpoint.

### Messages

- `GET /messages/conversations`: authenticated conversation summaries.
- `GET /messages/conversations/:otherUserId`: authenticated history; returns the newest page in chronological order. Use optional `before=<message_id>` and `limit` query parameters to load older pages; response includes `pagination.hasMore` and `pagination.nextCursor`.
- `PATCH /messages/conversations/:otherUserId/read`: authenticated mark received messages read.

Message sending is Socket.IO-only in the current client.

## Property Lifecycle

```text
register property + images
  -> private property in Properties/Property_Images
  -> owner creates one Posts row with rent or sell
  -> /post/posts exposes it publicly
  -> Home/Explore display it
  -> details page loads /property/properties/:propertyId
```

Deleting a property cascades database rows for posts and images, while the service separately tries to delete Cloudinary assets. Property registration and image insertion are not transactional, so partial failures can leave inconsistent DB/Cloudinary state.

## Socket.IO Contract

Client connects to `VITE_SOCKET_URL` with `{ auth: { token } }`.

Server authentication in `src/socket.js` verifies the JWT and joins the socket to `user:<userId>`.

Client -> server:

- `message:send`, payload `{ receiverId, postId?, text }`, acknowledgement `{ ok, data? | message? }`.
- `message:read`, payload `{ otherUserId }`, acknowledgement `{ ok, message? }`.

Server -> client:

- `message:new`: persisted message object, emitted to sender and receiver rooms.
- `message:read`: `{ readerId }`, emitted to the other participant.

`createMessage` validates integer recipient, prevents self-messaging, trims text, requires 1-5000 characters, and optionally validates numeric `postId`. Sender identity always comes from the authenticated socket, not the payload.

Frontend owner: `src/components/MessagePanel/messagePanel.jsx`. It loads conversation data through REST, subscribes to socket events, marks opened conversations read, and sends new messages through Socket.IO.

## Frontend Architecture

Top-level routing is in `src/App.jsx`:

Public:

- `/`: Landing
- `/login`: Login
- `/signup`: Signup

Protected under `/app/*`:

- `/app/home`: published posts excluding current user
- `/app/explore`: published posts plus client-side city/type/post-type filtering
- `/app/my-properties`: create, edit, delete, publish properties
- `/app/properties/:propertyId`: details and gallery
- `/app/profile`: profile editing

`ProtectedRoute` renders protected routes only while `AuthContext` has a valid token. Invalid or expired startup tokens are removed before routing.

`AuthContext` now validates the JWT `exp` claim at startup and removes expired or malformed sessions. Authenticated requests use `authenticatedFetch`, which clears the session on HTTP 401; Socket.IO authentication failures do the same. Invalid sessions redirect to `/` through `ProtectedRoute`.

Contexts:

- `AuthContext.jsx`: login, registration, logout, local storage, profile hydration, `apiUrl`.
- `SocketContext.jsx`: creates/disconnects Socket.IO connection based on token.

Important components:

- `AppSidebar`: app navigation.
- `Navbar`: messages toggle and global message target.
- `PropertyCard`: card rendering, details link, owner-message action, owner actions.
- `MessagePanel`: inbox and conversation thread.
- `Loader`: loading state.

`propertyDisplay.js` converts backend rows into card data and parses JSON image aggregation. Keep its output fields compatible with `PropertyCard`:

```text
property_id, post_id, user_id, owner_name, title, city, address,
price, type, postType, image, images
```

## Environment and Commands

Backend `.env`:

```text
PORT
CLIENT_URL
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
JWT_SECRET
CLOUD_NAME
CLOUD_API_KEY
CLOUD_API_SECRET
```

Frontend `.env`:

```text
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

Commands:

```text
cd Thikana_Backend && npm install && npm start
cd Thikana_Frontend && npm install && npm run dev
cd Thikana_Frontend && npm run build
cd Thikana_Frontend && npm run preview
cd Thikana_Frontend && npm run format
```

Backend `npm test` is a placeholder and exits with an error. No automated tests, seed scripts, OpenAPI definition, or migration system currently exist.

## Agent Modification Rules

1. Preserve the existing ESM style in the backend and JSX/Sass style in the frontend.
2. Keep API response shapes compatible with existing consumers before changing both sides together.
3. For authenticated operations, derive identity from JWT and re-check ownership server-side.
4. For new schema changes, update table creation SQL and consider existing databases because startup does not migrate columns.
5. For image changes, coordinate Cloudinary cleanup with DB updates.
6. For new frontend API calls, use `AuthContext.apiUrl` and include the Bearer token where required.
7. For real-time features, update both Socket.IO server handlers and `SocketContext`/consumer subscriptions.
8. When project behavior, setup, architecture, or workflows change, update both root Markdown files, `README.md` and `AI_CONTEXT.md`, as needed.
9. Remove hazards from this document once they are fixed; keep only unresolved hazards and update their wording to match the current implementation.
10. Validate with `npm run build` for frontend changes; manually test backend/API changes because no test suite exists.
11. Do not commit `.env` or reveal credentials.

## Known Hazards / Incomplete Areas

- Request validation, global error handling, rate limiting, and security headers are still not centralized.
- Controllers still repeat raw-token extraction while the middleware migration is incomplete.
- Public property endpoints may expose unpublished/private properties.
- Post uniqueness is enforced only by application logic and can race.
- Property/image workflows are not transactional.
- `postId` on messages is not fully checked against conversation context.
- Password-change validation historically uses exactly eight characters despite an “at least 8” message; verify before changing related behavior.
- Search UI is currently visual only.
- Explore city filters are hard-coded.
- Profile-picture/password APIs and property image-management APIs are not fully represented in the frontend UI.
- Errors on several frontend data-loading paths are intentionally or effectively suppressed.
- A multi-process deployment needs a shared Socket.IO adapter such as Redis.
