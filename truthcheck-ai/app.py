import os
import json
from flask import Flask, render_template, request, jsonify
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Initialize Gemini Client
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

SYSTEM_PROMPT = """
You are TruthCheck AI, an expert, objective fact-checking assistant.
Analyze the provided news headline, article, or claim for factual accuracy, bias, and credibility.

CRITICAL RULES:
1. Never state that an article is definitely true or definitely fake. Use terms like "Likely Reliable", "Possibly Misleading", or "Likely Fake".
2. Never invent fake URLs, sources, or evidence. If specific live evidence sources are unknown, return an empty evidence array or provide general context explicitly without making up URLs.
3. Distinguish claim status strictly using: "SUPPORTED", "PARTIALLY_SUPPORTED", "UNVERIFIED", or "CONTRADICTED".
4. Output ONLY valid JSON matching the exact specified format. Do not include markdown formatting or extra text outside the JSON.

Expected JSON schema:
{
  "classification": "LIKELY_RELIABLE" | "POSSIBLY_MISLEADING" | "LIKELY_FAKE",
  "score": number (0 to 100),
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "summary": "Short clear summary explanation",
  "claims": [
    {
      "claim": "Extracted claim text",
      "status": "SUPPORTED" | "PARTIALLY_SUPPORTED" | "UNVERIFIED" | "CONTRADICTED",
      "explanation": "Brief explanation of this claim status"
    }
  ],
  "reasons": [
    "Reason 1",
    "Reason 2"
  ],
  "evidence": [
    {
      "source": "Name of real source or organization",
      "url": "",
      "summary": "Description of evidence or factual context"
    }
  ]
}
"""

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/analyze", methods=["POST"])
def analyze():
    if not client:
        return jsonify({
            "error": "API Key not configured. Please set GEMINI_API_KEY in your .env file."
        }), 500

    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "No text provided for analysis."}), 400

    if not isinstance(data["text"], str):
        return jsonify({"error": "Text must be a string."}), 400

    text = data["text"].strip()
    if not text:
        return jsonify({"error": "Input text cannot be empty."}), 400

    if len(text) > 10000:
        return jsonify({"error": "Text is too long. Please limit to 10,000 characters."}), 400

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"Analyze the following text for factual credibility:\n\n{text}",
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                max_output_tokens=1500,
                temperature=0.2,
                response_mime_type="application/json"
            )
        )

        raw_content = (response.text or "").strip()
        if not raw_content:
            raise ValueError("Gemini returned an empty response.")
        
        # Clean potential markdown formatting
        if raw_content.startswith("```json"):
            raw_content = raw_content[7:]
        if raw_content.endswith("```"):
            raw_content = raw_content[:-3]
        raw_content = raw_content.strip()

        result = json.loads(raw_content)

        # Basic Validation
        required_keys = ["classification", "score", "confidence", "summary", "claims", "reasons"]
        for key in required_keys:
            if key not in result:
                raise ValueError(f"Missing required field: {key}")

        return jsonify(result)

    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse AI evaluation output. Please try again."}), 500
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
