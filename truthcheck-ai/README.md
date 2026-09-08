# TruthCheck AI - Fake News Detector

TruthCheck AI is a lightweight web application that helps users analyze news articles, claims, and headlines to determine factual credibility and detect potential misinformation using the Gemini API.

## Features
- **Credibility Scoring**: Generates a score from 0 to 100.
- **Status Classification**: Classifies text as `Likely Reliable`, `Possibly Misleading`, or `Likely Fake`.
- **Claim Extraction & Status**: Breaks down text into main claims and rates each (`SUPPORTED`, `PARTIALLY_SUPPORTED`, `UNVERIFIED`, `CONTRADICTED`).
- **Reasoning & Evidence**: Highlights indicators of misinformation and provides verification context.
- **Demo Mode**: Built-in interactive test cases.

## Technology
- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Python Flask
- **AI Integration**: Google Gemini API (`gemini-2.5-flash`)

## Installation & Setup

1. **Extract and Navigate to Project**:
   ```bash
   unzip truthcheck-ai.zip
   cd truthcheck-ai
   ```

2. **Create and activate virtual environment**:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up API Key**:
   Copy `.env.example` to `.env`:
   ```bash
   # macOS/Linux:
   cp .env.example .env
   # Windows PowerShell:
   Copy-Item .env.example .env
   ```
   Open `.env` and set your key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```

## Running the Application

Start the Flask app:
```bash
python app.py
```
Open your browser and visit: `http://127.0.0.1:5000`
