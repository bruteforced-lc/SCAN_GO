# Scan&Go

Scan products with your phone camera, pay in the app and leave the store by showing an exit QR code.

**Stack:** React (Vite) + Tailwind, Node.js + Express, MongoDB, Docker.

## Features

- Register / login (JWT, bcrypt)
- Scan barcodes with the camera (or type the barcode)
- Cart with quantity limits based on stock
- Checkout (demo payment) with atomic stock update
- Exit QR code per order, verified at the gate by an admin (one-time use)
- Admin panel: product CRUD, exit gate verification, recent orders

## Project structure

```
scan-and-go/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   └── src/
│       ├── app.js            Express app + routes
│       ├── server.js         DB connect + start
│       ├── seed.js           sample products + admin user
│       ├── config/db.js
│       ├── models/           User, Product, Order
│       ├── controllers/      auth, product, order logic
│       ├── routes/
│       ├── middleware/       auth (JWT, admin), error handler
│       └── utils/
└── frontend/
    ├── Dockerfile, nginx.conf, vercel.json
    └── src/
        ├── main.jsx, App.jsx, api.js
        ├── context/          AuthContext, CartContext
        ├── components/       Navbar, ProtectedRoute, Scanner
        └── pages/            Login, Register, Scan, Cart, Checkout,
                              Orders, OrderDetail, Admin
```

## Run with Docker (easiest)

```bash
docker compose up --build
# in another terminal, add sample data once:
docker compose exec backend npm run seed
```

- App: http://localhost:3000
- API: http://localhost:5000/api/health
- Admin login: `admin@scango.com` / `admin123` (change it before deploying)

## Run without Docker

You need Node 18+ and MongoDB running locally.

```bash
# terminal 1
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev

# terminal 2
cd frontend
npm install
npm run dev     # http://localhost:5173
```

## Testing the scanner

1. Run `npm run seed`. It prints the barcodes of the sample products.
2. Create a barcode or QR image for one of those numbers with any free online generator and open it on another screen.
3. Camera access works only on `localhost` or HTTPS. On a phone, use your deployed HTTPS URL.
4. No camera? Type the barcode in the box on the Scan page.

Exit gate flow: place an order as a customer, then log in as admin and scan / type the order's exit code on the Admin page. A code works only once.

## API

| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register | public |
| POST | /api/auth/login | public |
| GET | /api/auth/me | user |
| GET | /api/products?search= | public |
| GET | /api/products/barcode/:barcode | public |
| POST / PUT / DELETE | /api/products, /api/products/:id | admin |
| POST | /api/orders/checkout | user |
| GET | /api/orders/mine | user |
| GET | /api/orders/:id | owner or admin |
| GET | /api/orders | admin |
| POST | /api/orders/verify | admin |

## Free deployment

1. **Database:** create a free MongoDB Atlas cluster (M0), create a database user, allow network access, copy the connection string.
2. **Backend (Render):** new Web Service from your GitHub repo, root directory `backend`, runtime Docker. Environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your frontend URL).
3. **Frontend (Vercel or Netlify):** root directory `frontend`, build command `npm run build`, output `dist`. Add the environment variable `VITE_API_URL=https://<your-backend>.onrender.com/api`.
4. Run the seed once against Atlas: `cd backend && MONGO_URI="<atlas uri>" npm run seed`.

Free tiers can sleep after inactivity, so open the backend once before a demo.

## Ideas to extend

- Real payments with Razorpay (replace the mock branch in `orderController.checkout`)
- Product images and categories filter
- Deploy on AWS (EC2 + Docker, or S3 + CloudFront for the frontend)
- Tests with Jest / Supertest
