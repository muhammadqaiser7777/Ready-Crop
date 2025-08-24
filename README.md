<h1 align="center">🌱 Ready-Crop</h1>

<p align="center">
  Smart plant growth tracking, harvest prediction, and disease detection system using YOLOv8 and Roboflow.<br/>
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

**Ready-Crop** is a full-stack intelligent agriculture system that helps farmers and agri-tech users:

* Predict plant growth stage and harvest timelines
* Detect common plant diseases with confidence scores
* Receive actionable suggestions for disease management

Using deep learning and computer vision, users can upload plant images and get real-time feedback.

Key capabilities:

* Upload plant images to predict age (1–5 months), harvest stage, and disease
* View detected diseases with suggestions for treatment or prevention
* Store and manage predictions via Supabase PostgreSQL database
* Receive automated email and in-app reminders before harvest
* Clean, responsive frontend built with Angular
* Backend powered by Flask + YOLOv8 + PyTorch + SMTP + Supabase integration

---

## 🌟 Features

* 🔐 OTP-based Email Authentication
* 📷 Image Upload and ML-Based Prediction (YOLOv8)
* 🌱 Disease Detection for Green Chilli
  * Detects: Healthy, Anthracnose, Bacterial Spot, Dotted, Mozaic, Trips
  * Displays confidence score per detection
  * Provides actionable suggestions to manage disease
* 🗂 Plant Record Management with Timestamps
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
| ML Model     | YOLOv8 (Roboflow, PyTorch) + Disease Classifier |
| Database     | Supabase (PostgreSQL)          |
| Email System | SMTP (Gmail-based)             |
| Auth         | OTP-based, Supabase-integrated |

---

## ⚙️ Setup Instructions

### 📁 Clone the Repository

```bash
git clone https://github.com/muhammadqaiser7777/Ready-Crop.git
cd Ready-Crop
