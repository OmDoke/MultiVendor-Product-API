# MultiVendor Product API

A production-grade RESTful API system for multi-vendor product management. This system includes JWT authentication, seller onboarding by admins, product management with image uploads, and dynamic PDF generation.

## 🚀 Features
- **Admin Panel**: Manage sellers and oversee operations.
- **Seller Panel**: Manage products and brand variations.
- **Image Uploads**: Integrated with Multer for handling brand images.
- **PDF Generation**: Dynamically generate product reports with embedded images using PDFKit.
- **Security**: Password hashing with bcryptjs and role-based access control with JWT.
- **Validation**: Strict input validation using express-validator.

---

## 🛠️ Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Auth**: JWT (JSON Web Token)
- **File Handling**: Multer
- **Utilities**: PDFKit, bcryptjs, express-validator

---

## 📋 Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- npm or yarn

---

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd MultiVendor-Product-API
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and copy content from `.env.example`.
   ```bash
   cp .env.example .env
   ```

4. **Seed the Admin User**:
   Before starting the server, run the seeder to create the default admin account.
   ```bash
   node seedAdmin.js
   ```
   - **Default Email**: `admin@example.com`
   - **Default Password**: `admin123`

5. **Start the Server**:
   - For Production: `npm start`
   - For Development: `npm run dev`

---

## 📡 API Endpoints

### Admin APIs
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| POST | `/api/admin/login` | Login and get JWT token | Public |
| POST | `/api/admin/sellers` | Create a new seller account | Admin |
| GET | `/api/admin/sellers` | List all sellers (Paginated) | Admin |

### Seller APIs
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| POST | `/api/seller/login` | Login using admin-created credentials | Public |
| POST | `/api/seller/products` | Create product with brand images (Multipart) | Seller |
| GET | `/api/seller/products` | List seller's products (Paginated) | Seller |
| GET | `/api/seller/products/:id/pdf` | Generate & stream product detail PDF | Seller |
| DELETE | `/api/seller/products/:id` | Delete product and associated images | Seller |

---

## 📤 Product Creation Details
When creating a product via `POST /api/seller/products`, use **multipart/form-data**:

- **Fields**:
  - `productName`: String
  - `productDescription`: String
  - `brands`: JSON string array. Example:
    ```json
    [
      { "brandName": "Brand A", "detail": "Details", "price": 100 }
    ]
    ```
- **Files**:
  - `brands[0][image]`: File (Image)
  - `brands[1][image]`: File (Image)

---

## 📄 License
This project is licensed under the ISC License.
