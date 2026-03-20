# 📊 Attendance Tracker

A simple **Attendance Tracking System** that allows users to upload and manage student attendance records efficiently. The system processes attendance data and provides summarized insights like **total students, present count, and attendance percentage**.

---

## 🚀 Features

* Upload attendance records
* Automatic calculation of:

  * Total students
  * Present students
  * Attendance percentage
* Clean and simple interface
* Backend API for processing attendance data
* Summary statistics dashboard

---

## 🛠️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Python
* FastAPI

### Database

* MySQL

---

## 📂 Project Structure

```
attendance-tracker
│
├── backend
│   ├── main.py
│   ├── database.py
│   └── models.py
│
├── frontend
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```
git clone https://github.com/kushal-4656/Attendance-tracker.git

cd attendance-tracker
```

---

### 2️⃣ Create virtual environment

```
python -m venv attendence
```

Activate it:

**Windows**

```
attendence\Scripts\activate
```

---

### 3️⃣ Install dependencies

```
pip install -r requirements.txt
```

---

### 4️⃣ Run the backend server

```
uvicorn main:app 
```

---

### 5️⃣ Open the frontend

Open `index.html` in your browser.

---

## 📊 Example Output

The dashboard shows:

* Total Strength
* Total Present
* Attendance Percentage

---

