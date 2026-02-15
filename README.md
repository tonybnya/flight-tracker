# Flight Tracker

A simple and comprehensive flight tracking application built with **React** (Frontend) and **Flask** (Backend). This application allows users to search for real-time flight information using flight numbers via the Aviation Stack API. Users can even click on the card results to add the flight on their Google Calendar.

## Features

- ✈️ **Real-time Flight Tracking**: Search by IATA flight number.
- 📊 **Detailed Information**: View airline, departure/arrival airports, scheduled times, and more.
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS and Lucide icons.
- 🚀 **Fast Performance**: Powered by Vite and Flask.

## Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: JavaScript (JSX)

### Backend
- **Framework**: Flask
- **API**: Aviation Stack (External)
- **Language**: Python

## Prerequisites

Before running the application, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **pnpm** (recommended) or npm

You will also need an API key from [Aviation Stack](https://aviationstack.com/).

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd flight-tracker
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment (optional but recommended):

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Configure environment variables:
1. Create a `.env` file in the `backend` directory based on `.env.example`.
   ```bash
   cp .env.example .env
   ```
2. Add your **Aviation Stack API Key** and **API URL** to the `.env` file.
   ```
   AVIATION_STACK_API_KEY=your_api_key_here
   AVIATION_STACK_API_URL=http://api.aviationstack.com/v1/flights
   ```
   *(Note: The free tier of Aviation Stack supports HTTP only. Use HTTPS if you have a paid plan.)*

Start the backend server:

```bash
python app.py
```
 The server will start on `http://127.0.0.1:5000`.

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
pnpm install
# or
npm install
```

Start the development server:

```bash
pnpm dev
# or
npm run dev
```

The application will be available at `http://localhost:5173`.

## Usage

1. Ensure both backend and frontend servers are running.
2. Open `http://localhost:5173` in your browser.
3. Enter a valid IATA flight number (e.g., `AA100`) in the search bar.
4. View the flight details!

## License

This project is open-source and available under the MIT License.
