# My Personal AI Assistant

**Live Website**: [https://my-personal-ai-assistant-v76d.onrender.com](https://my-personal-ai-assistant-v76d.onrender.com)

<br/>

<img width="739" alt="AI Assistant Demo" src="https://github.com/user-attachments/assets/07bdc49d-5200-425e-bff4-63b529bc2ca2" />

---

## Tech Stack

* **Frontend**: React, Tailwind CSS, Web Speech API
* **Backend**: Node.js, Express.js, MongoDB
* **Authentication**: JWT, bcryptjs
* **AI Integration**: DeepSeek AI (can be swapped with Gemini, OpenAI, etc.)
* **File Uploads**: Multer, Cloudinary
* **Deployment**: Render

---

## Features

* Voice-controlled AI assistant using the Web Speech API (SpeechRecognition + SpeechSynthesis)
* Natural conversation with an AI backend
* Supports tasks like opening websites, Google/YouTube search, weather retrieval
* Secure authentication system using JWT
* User profile upload functionality with Cloudinary
* Scalable and modular backend architecture

---

## Local Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/My-personal-Ai-Assistant.git
cd My-personal-Ai-Assistant
```

### 2. Install Dependencies

#### Frontend

```bash
cd client
npm install
```

#### Backend

```bash
cd ../server
npm install
```

---

### 3. Create `.env` File in Backend

Inside the `/server` directory, create a `.env` file and add the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
AI_API_KEY=your_deepseek_or_other_ai_api_key
```

> Make sure to replace the placeholders with your actual credentials.

---

### 4. Run the Application

#### Start Backend

```bash
cd server
npm run dev
```

#### Start Frontend

```bash
cd client
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to access the application locally.

---

## Project Structure

```
My-personal-Ai-Assistant/
│
├── frontend/                  # React frontend
│   ├── src/
│   └── public/
│
├── backend/                  # Express backend
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── utils/
│   └── config/
│
├── .gitignore
├── README.md
└── ...
```

---

## Deployment

The project is deployed using **Render** for both client and server.

To deploy your own version:

* Set up two Render web services (one for frontend, one for backend)
* Configure the environment variables in the backend service

---

## Contributing

If you'd like to suggest improvements, report bugs, or contribute features, feel free to open an issue or submit a pull request.

---

## License

This project is licensed under the MIT License.

---
