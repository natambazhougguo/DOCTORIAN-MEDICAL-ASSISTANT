# Doctorian AI - Local Setup Guide

This project was developed by **AKORA JOSEPH** from **Dr. Obote College**. It is a professional medical intelligence companion designed to provide evidence-based health insights.

## Prerequisites

- **Node.js**: Ensure you have Node.js (v18 or higher) installed.
- **npm**: Standard Node Package Manager.
- **VS Code (VSC)**: Recommended for local development.
- **Gemini API Key**: The project is pre-configured with a key, but you can use your own for higher limits. Get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Getting Started

1. **Clone or Download**: Get the project files onto your local machine.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Environment Setup (VS Code / Local)**:
   - The project is **pre-configured** with a fallback Gemini API key.
   - To use your own key in VS Code or other software, create a file named `.env` in the root directory.
   - Copy the following line into your new `.env` file:
     ```env
     GEMINI_API_KEY="AIzaSyADzRa4RnF75BnL_rnfzNPnH2tlj2Sfjkw"
     ```
   - You can replace the value above with your own key from [Google AI Studio](https://aistudio.google.com/app/apikey).
4. **Run the Project**:
   ```bash
   npm run dev
   ```
5. **Open in Browser**: The application will be running at `http://localhost:3000`.

## Independent & Downloaded App

- **Standalone Mode**: The app is a Progressive Web App (PWA). You can "install" it to your device (Desktop or Mobile) to run it independently of the browser.
- **Baking the API Key**: When you build the app (`npm run build`), the API key is baked into the code. This ensures that the "downloaded" (installed) app works perfectly without any extra configuration.

- `src/`: Contains the React source code.
- `src/components/`: Reusable UI components (Chat, Image Generator, Patient Monitor, etc.).
- `src/hooks/`: Custom React hooks (e.g., `useArduino` for vital signs simulation).
- `vite.config.ts`: Configuration for the Vite build tool.

## Key Features

- **Live Medical Assistant**: AI-powered chat for health inquiries.
- **Patient Monitor**: Real-time visualization of vital signs (Heart Rate, SpO2, Blood Pressure, etc.).
- **Health Records**: Comprehensive prescription and patient record management.
- **Anatomical Illustrator**: AI-generated medical illustrations.

---
*Developed by AKORA JOSEPH (Dr. Obote College)*
*Headteacher: Mr. ALENGO DICK*
*Deputy Administration: Mr. Ogwang Tom*
*Deputy in charge Academics: Mr. Okumu Samuel*
*Deputy in charge Welfare: Mr. Epilla Banana Andrew*
*Head of ICT: Mr. ANGURA JAMES*
