# 📔 Notes Sphere

**Notes Sphere** is a modern, full-stack digital note-management platform designed to help users organize their study materials and documents with ease. Built with the MERN stack, it provides a seamless experience for uploading, categorizing, and accessing notes from anywhere.

🚀 **Live Demo:** [https://notes-sphere-swart.vercel.app/](https://notes-sphere-swart.vercel.app/)

---

## 📸 Preview

![App Screenshot](./images/screenshot.png)

---

## ✨ Features

- **📤 Secure Note Upload:** Easily upload and store your PDF, DOC, and text files securely.
- **📁 Smart Organization:** Categorize your notes by subjects, topics, and tags to ensure you never lose track of your materials again.
- **🌐 Everywhere Access:** Access your notes from any device, anytime. Your study materials are always just a login away.
- **🔐 User Authentication:** Secure signup and login system using JWT and Bcrypt for data protection.
- **💻 Modern UI/UX:** A clean, responsive, and intuitive interface designed for the best user experience.

---

## 🛠️ Tech Stack

### Frontend
- **React 19:** Building a dynamic and responsive UI.
- **React Router 7:** Handling client-side routing.
- **CSS:** Custom styling for a premium look and feel.

### Backend
- **Node.js & Express 5:** Powering the robust server-side logic.
- **MongoDB & Mongoose:** Scalable NoSQL database for flexible data storage.
- **JWT (JSON Web Tokens):** Secure authentication and session management.
- **Multer:** Handling file uploads efficiently.
- **BcryptJS:** Industry-standard password hashing.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB account (or local installation)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ankur5529/Notes_Sphere_Mern.git
   cd Notes_Sphere_Mern
   ```

2. **Setup the Server:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory and add your credentials:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
   Start the server:
   ```bash
   npm run dev
   ```

3. **Setup the Client:**
   ```bash
   cd ../client
   npm install
   ```
   Start the frontend:
   ```bash
   npm start
   ```

---

## 📂 Project Structure

```text
Notes_Sphere_Mern/
├── client/           # React frontend
│   ├── src/          # Components, pages, and logic
│   └── public/       # Static assets
├── server/           # Express backend
│   ├── models/       # Database schemas
│   ├── routes/       # API endpoints
│   ├── middleware/   # Authentication & file processing
│   └── uploads/      # Temporary file storage
└── images/           # Project screenshots & assets
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the ISC License.

---

**Developed with ❤️ by [Ankur](https://github.com/Ankur5529)**
