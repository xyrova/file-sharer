# 📁 File Sharing App

A simple, secure web application for sharing files using unique PINs. Upload a file, get a PIN, and share it. Others can download the file using that PIN without needing an account.

---

## ✨ Features

*   ⬆️ **File Upload**: Easily upload a single file.
*   🔑 **PIN Generation**: Automatically generates a unique, secure PIN for every upload.
*   🔒 **Secure Download**: Files are only accessible with the correct PIN.
*   👤 **No Signup Required**: Quick and anonymous file sharing.

---

## 🛠️ Technologies Used

*   **Frontend**: React, Tailwind CSS
*   **Backend**: Spring Boot, Java 17
*   **Database**: MySQL
*   **File Handling**: Axios (for Multipart upload), Local File System Storage
*   **Security**: PIN-based access control

---

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   [Java Development Kit (JDK) 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) or later
*   [Apache Maven](https://maven.apache.org/download.cgi)

---

## 🚀 Installation & Setup

### Backend Setup (Spring Boot)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/nahcol10/file-sharer.git
    cd file-sharer
    ```

2.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

3.  **Configure Application Properties (Optional):**
    Modify `src/main/resources/application.properties` if you need to change database credentials, server port, or the file storage location.
    ```properties
    # Example configurations (update as needed)
    # spring.datasource.url=jdbc:mysql://localhost:3306/your_database_name
    # spring.datasource.username=your_db_username
    # spring.datasource.password=your_db_password
    # file.storage.location=/path/to/your/storage/directory
    # server.port=8080
    ```

4.  **Run the Spring Boot application:**
    ```bash
    mvn spring-boot:run
    ```
     Razz The backend server will start, typically running at `http://localhost:8080`.

### Frontend Setup (React)

1.  **Navigate to the frontend directory:**
    ```bash
    # Assuming you are in the root 'file-sharer' directory
    cd ../frontend
    # Or if you are in the 'backend' directory
    # cd ../frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run start
    ```
     The frontend development server will start, typically accessible at `http://localhost:5173`.

---

## 💻 Usage

1.  **Upload a File:**
    *   Open your web browser and navigate to the frontend URL (e.g., `http://localhost:5173`).
    *   Use the upload interface to select and upload your file.
    *   Once the upload is complete, a unique **PIN** will be displayed on the screen.
    *    securely share this PIN with the person you want to give access to the file.

2.  **Download a File:**
    *   The recipient should navigate to the frontend application (e.g., `http://localhost:5173`).
    *   They will find an option or page (often linked, perhaps like `http://localhost:5173/download`) to enter a PIN.
    *   Enter the correct PIN received from the uploader.
    *   If the PIN is valid, a download link or an automatic download prompt for the associated file will appear.

---

## 🔌 API Endpoints

The backend exposes the following RESTful endpoints:

### 1. File Upload

*   **URL**: `/upload-file`
*   **Method**: `POST`
*   **Request Body**: `MultipartFile` (The file being uploaded, typically named `file` in the form data).
*   **Success Response**: `200 OK` with the generated `PIN` (String) in the response body.
*   **Error Response**: Appropriate HTTP status codes (e.g., `400 Bad Request`, `500 Internal Server Error`).

### 2. File Download

*   **URL**: `/download`
*   **Method**: `GET`
*   **Query Parameter**: `pin` (The unique PIN associated with the file).
    *   Example: `http://localhost:8080/download?pin=ABC123`
*   **Success Response**: `200 OK` with the file content as an attachment (`Content-Disposition: attachment; filename="yourfile.ext"`).
*   **Error Response**:
    *   `404 Not Found`: If the PIN is invalid or the file doesn't exist.
    *   `500 Internal Server Error`: If there's an issue retrieving the file.

---