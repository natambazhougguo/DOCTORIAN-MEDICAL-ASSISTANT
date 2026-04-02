# Doctorian AI - Local Setup Guide

This project was developed by **AKORA JOSEPH** from **Dr. Obote College**. It is a professional medical intelligence companion designed to provide evidence-based health insights.

## Prerequisites

- **Node.js**: Ensure you have Node.js (v18 or higher) installed.
- **npm**: Standard Node Package Manager.
- **Gemini API Key**: You will need a Google Gemini API key to power the AI features.

## Getting Started

1. **Clone or Download**: Get the project files onto your local machine.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Environment Setup**:
   - Create a file named `.env` in the root directory.
   - Copy the contents from `.env.example` into `.env`.
   - Replace `MY_GEMINI_API_KEY` with your actual Gemini API key.
   ```env
   GEMINI_API_KEY="your_actual_key_here"
   ```
4. **Run the Project**:
   ```bash
   npm run dev
   ```
5. **Open in Browser**: The application will be running at `http://localhost:3000` (or the port specified in the terminal).

## Project Structure

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
