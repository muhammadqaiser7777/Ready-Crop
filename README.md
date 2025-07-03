<h1 align="center">🌱 Ready-Crop</h1>

<p align="center">
  Smart plant growth tracking and harvest prediction system using YOLOv8 and Roboflow.<br/>
  Built with Flask, Angular, and Supabase.
</p>

<div align="center">
  <img src="https://img.shields.io/badge/Backend-Flask-blue" />
  <img src="https://img.shields.io/badge/Frontend-Angular-DD0031" />
  <img src="https://img.shields.io/badge/Database-Supabase-3ECF8E" />
  <img src="https://img.shields.io/badge/Model-YOLOv8-FFD700" />
  <img src="https://img.shields.io/badge/Status-In%20Progress-yellow" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</div>

---

## 📸 Overview

**Ready-Crop** is a full-stack intelligent agriculture system that helps farmers and agri-tech users predict the growth stage of plants and estimate harvest timelines using deep learning and computer vision.

Key capabilities:

* Upload plant images to predict age (1–5 months) or harvest stage
* Store and manage predictions via a Supabase PostgreSQL database
* Receive automated email and in-app reminders before harvest
* Clean, responsive frontend built with Angular
* Backend powered by Flask + YOLOv8 + SMTP + Supabase integration

---

## 🌟 Features

* 🔐 OTP-based Email Authentication
* 📷 Image Upload and ML-Based Prediction (YOLOv8)
* 🌱 Plant Record Management with Timestamps
* ✉️ Automated Email Reminders (3 weeks & 1 week before harvest)
* 🔔 In-App Notifications
* 📊 Supabase PostgreSQL Storage
* 🧞 Full RESTful API

---

## 🛠 Tech Stack

| Layer        | Technology                     |
| ------------ | ------------------------------ |
| Frontend     | Angular, TypeScript, HTML/CSS  |
| Backend      | Flask (Python), REST API       |
| ML Model     | YOLOv8 (Roboflow, PyTorch)     |
| Database     | Supabase (PostgreSQL)          |
| Email System | SMTP (Gmail-based)             |
| Auth         | OTP-based, Supabase-integrated |

---

## ⚙️ Setup Instructions

### 📁 Clone the Repository

```bash
git clone https://github.com/muhammadqaiser7777/Ready-Crop.git
cd Ready-Crop
```

### 🖙 Backend (Flask)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Then fill in your actual values
python app.py
```

### 🌐 Frontend (Angular)

```bash
cd web
npm install
ng serve
# Visit: http://localhost:4200
```

---

## 🧾 .env Configuration

Create a `.env` file inside the `backend/` folder with the following:

```env
SUPABASE_URL=Supabase-URL
SUPABASE_KEY=Supabase-API-Key

SECRET_KEY=Your-Secret-Key-For-Production
TEMP_SECRET_KEY=Temporary-Secret-Key-For-Development

WEB_URL=Front-end-URL

MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=Your-Email
MAIL_PASSWORD=App-Password-Gmail
MAIL_USE_TLS=True
MAIL_USE_SSL=False
```

---

## 🌿 ML Integration

* Dataset labeled and trained using **Roboflow**
* YOLOv8 model exported as `.pt` and loaded via PyTorch
* Flask serves the model via `/predict-green-chilli`
* Classes used: `1 month` to `5 month`, `Harvest` (ignores `Soil`, `null`)

---

## ✉️ Email Reminder Logic

A scheduled job (via `mailReminderController.py`) checks plant records and sends:

* 📩 3-week-before-harvest reminder
* 📩 1-week-before-harvest reminder

Based on:

* `class` (predicted plant age)
* `updated_at` timestamp (last prediction date)

---

## 🔁 API Endpoints

### 🔐 Authentication

| Endpoint | Method | Description              |
| -------- | ------ | ------------------------ |
| /signup  | POST   | Register new user        |
| /verify  | POST   | Verify email with OTP    |
| /login   | POST   | Log in and receive token |
| /logout  | POST   | Invalidate token         |

### 🔑 Password Management

| Endpoint          | Method | Description                     |
| ----------------- | ------ | ------------------------------- |
| /change-password  | POST   | Change password (auth required) |
| /password-forget  | POST   | Initiate password reset         |
| /verify-identity  | POST   | Verify identity via OTP         |
| /set-new-password | POST   | Set a new password              |

### 🔁 OTP Handling

| Endpoint      | Method | Description  |
| ------------- | ------ | ------------ |
| /otp-refresh  | POST   | Resend OTP   |
| /validate-otp | POST   | Validate OTP |

### 🌿 Prediction

| Endpoint              | Method | Description                    |
| --------------------- | ------ | ------------------------------ |
| /predict-green-chilli | POST   | Predict plant class from image |

### 🌱 Plant Records

| Endpoint             | Method | Description            |
| -------------------- | ------ | ---------------------- |
| /save-plant-record   | POST   | Save prediction result |
| /view-plant-records  | POST   | View all plant records |
| /delete-plant-record | POST   | Delete a record by ID  |

### 📧 Email & 🔔 Notifications

| Endpoint                    | Method | Description                    |
| --------------------------- | ------ | ------------------------------ |
| /send-email-reminder        | POST   | Trigger reminder emails        |
| /generate-notifications     | POST   | Generate in-app notifications  |
| /check-unread-notifications | POST   | Check for unread notifications |
| /get\_user\_notifications   | GET    | Fetch all user notifications   |

---

## 📆 Project Structure

```
Ready-Crop/
├── backend/
│   ├── app.py
│   ├── controllers/
│   ├── config/
│   ├── ml/
│   ├── .env
│   └── requirements.txt
├── web/                # Angular frontend
│   └── src/
├── model/              # YOLOv8 model
└── README.md
```

---

## ✨ Roadmap

* [ ] Multi-plant support (e.g. wheat, tomato)
* [ ] Admin & role-based access
* [ ] Analytics dashboard
* [ ] Docker + CI/CD deployment
* [ ] Cloud hosting (Render, Vercel, etc.)

---

## 📜 License

Licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Muhammad Qaiser**
📧 [YourEmail@example.com](mailto:qaiserakram7777@gmail.com)
🔗 GitHub: [@muhammadqaiser7777](https://github.com/muhammadqaiser7777)
