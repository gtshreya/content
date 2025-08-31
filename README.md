# 📑 Content Extractor & Hashtag Generator

This project is a lightweight full-stack web app that allows you to **extract text from PDF or image files (PNG, JPG, JPEG)** and then **generate hashtag suggestions** based on the extracted text.

It uses:
- **Backend:** Node.js + Express, with [`pdf-parse`](https://www.npmjs.com/package/pdf-parse) and [`tesseract.js`](https://github.com/naptha/tesseract.js) for text extraction.
- **Frontend:** Next.js + React with TailwindCSS and Framer Motion for a modern UI and animations.

---

## ✨ Features
- 📂 **File Upload** – drag & drop or click-to-browse files (PDF, PNG, JPG, JPEG).
- 📝 **Text Extraction** – extracts content from documents and images.
- 🏷 **Hashtag Suggestion** – generates simple hashtag recommendations from extracted text.
- 🎨 **Modern UI** – responsive design with smooth animations (Framer Motion).

---

## ⚙️ How It Works

### 🔹 Frontend Flow
1. User uploads a **PDF or image** via drag & drop or file picker.
2. The file is sent to the backend via `POST /api/extract`.
3. The backend extracts text using:
   - `pdf-parse` → if the file is a **PDF**.
   - `tesseract.js` → if the file is an **image**.
4. Extracted text is displayed on the frontend.
5. That text is then sent to the backend via `POST /api/suggest` to generate hashtags.
6. Suggested hashtags are displayed along with the extracted text.
7. User can reset the state and upload another file.

### 🔹 Backend Flow
- **Express.js** server with two main routes.
- **Multer** handles file upload (in memory).
- **pdf-parse** extracts text from PDFs.
- **tesseract.js** extracts text from images (OCR).
- A simple algorithm filters long words and removes common stop words to generate hashtags.

---

## 🌐 API Routes

### **1. `POST /api/extract`**
👉 Extract text from a file (PDF or image).

- **Request:**
  - `form-data`
    - key: `file` (PDF, PNG, JPG, JPEG)

- **Response (success):**
```json

{

&nbsp; "text": "This is the extracted text from the document..."

}


