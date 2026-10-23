# 📚 NotesHub — Student Notes Sharing Platform

> **A 3rd-Year B.Tech CSE Mini Project**  
> Built with HTML5, CSS3, Vanilla JavaScript, Java Spring Boot, Spring Security, Spring Data JPA, and MySQL / H2.

---

## 🌟 Project Overview
**NotesHub** is a responsive full-stack web application designed for college students to upload, organize, search, preview, and download study notes in PDF format categorized by Branch, Semester, Subject, and Academic Topics.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | HTML5, CSS3, Modern JavaScript | Responsive UI, Live Search, Dynamic Branch & Sem Filters, Modal Previews |
| **Backend** | Java 21+ / Spring Boot 3.4.2 | RESTful Controllers, Multipart File Uploads, PDF Byte Streaming |
| **Security** | Spring Security 6 & BCrypt | Password encryption, CORS configuration, Role-based user handling |
| **Persistence** | Spring Data JPA & Hibernate | Custom query filtering with HQL/JPQL |
| **Database** | H2 (Default zero-setup) & MySQL | Embedded persistent storage in `./data/noteshubdb` or MySQL `noteshub` DB |
| **Build Tool** | Apache Maven Wrapper (`mvnw` / `mvnw.cmd`) | Self-bootstrapping build tool (no global Maven install required) |

---

## 📂 Project Structure

```text
NotesHub/
├── backend/                                   # Spring Boot REST API
│   ├── src/main/java/com/noteshub/
│   │   ├── config/
│   │   │   ├── SecurityConfig.java            # Security, CORS & H2 Console rules
│   │   │   └── DataInitializer.java           # Automatic DB & sample PDF seeding
│   │   ├── controller/
│   │   │   ├── HealthController.java          # API heartbeat & status
│   │   │   ├── NoteController.java            # Note listing, search, upload, download
│   │   │   └── AuthController.java            # Student registration & login
│   │   ├── entity/
│   │   │   ├── Note.java                      # Note entity with JSON getters
│   │   │   └── User.java                      # User entity with roles & BCrypt hashes
│   │   ├── repository/
│   │   │   ├── NoteRepository.java            # JPA repository with dynamic search query
│   │   │   └── UserRepository.java            # User persistence & existence queries
│   │   ├── service/
│   │   │   ├── FileStorageService.java        # PDF disk storage, retrieval, & stub generation
│   │   │   ├── NoteService.java               # Search, sort, downloads counter & stats
│   │   │   ├── UserService.java               # Password hashing & authentication
│   │   └── NoteshubApiApplication.java        # Main Spring Boot entry point
│   ├── src/main/resources/
│   │   ├── application.properties             # H2 persistent config & static frontend routing
│   │   └── application-mysql.properties       # MySQL database profile
│   ├── mvnw & mvnw.cmd                        # Maven Wrapper scripts
│   └── pom.xml                                # Spring Boot 3.4.2 Maven dependencies
├── frontend/                                  # Client Application (Served at http://localhost:8080)
│   ├── css/
│   │   └── style.css                          # Modern glassmorphism UI styles
│   ├── js/
│   │   └── app.js                             # API integration with offline fallback
│   ├── assets/                                # Icons & branding
│   └── index.html                             # Single-page application interface
├── uploads/                                   # Local storage for student uploaded PDFs
├── .gitignore                                 # Ignore rules (build artifacts, uploads, IDE files)
└── README.md                                  # Complete documentation
```

---

## 🚀 Quick Start Guide

### 1. Run the Application
Open a terminal in the project root:

```bash
cd backend
./mvnw.cmd spring-boot:run
```
*(On Linux/macOS, use `./mvnw spring-boot:run`)*

### 2. Access the Platform
- **Web Interface:** Open [http://localhost:8080/](http://localhost:8080/) in any modern browser.
- **H2 Database Console:** [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  - JDBC URL: `jdbc:h2:file:./data/noteshubdb`
  - User: `sa`
  - Password: *(leave blank)*

---

## 🔑 Pre-Seeded Demo Accounts

The application automatically seeds sample users upon first launch:

| Role | Email | Password |
|---|---|---|
| **Student** | `student@noteshub.edu` | `password123` |
| **Admin** | `admin@noteshub.edu` | `admin123` |

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & API version |
| `GET` | `/api/notes` | List notes (supports `?branch=CSE&semester=4&search=os&sortBy=downloads`) |
| `GET` | `/api/notes/{id}` | Retrieve single note metadata by ID |
| `POST` | `/api/notes` | Upload note with multipart PDF attachment |
| `GET` | `/api/notes/{id}/download` | Download PDF file and increment download counter |
| `DELETE` | `/api/notes/{id}` | Delete a note and its file from storage |
| `GET` | `/api/notes/stats` | Platform statistics (total notes, downloads, branches) |
| `POST` | `/api/auth/register` | Student registration (`{ name, email, password }`) |
| `POST` | `/api/auth/login` | Student login authentication (`{ email, password }`) |
| `GET` | `/api/auth/user?email=...` | Get user profile by email |

---

## 🗄️ Database Profiles

- **H2 (Default):** Zero configuration required. Data is saved in `./backend/data/noteshubdb` and persists across restarts.
- **MySQL:** To switch to MySQL, ensure MySQL server is running on port 3306 and start with:
  ```bash
  ./mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql
  ```
