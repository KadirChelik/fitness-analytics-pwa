// server/check-models.js
require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listModels() {
  try {
    console.log("🔍 Erişilebilir Modeller Listeleniyor...");
    const response = await ai.models.list();
    
    console.log("\n✅ İŞTE KULLANABİLECEĞİN MODELLER:");
    // Yeni SDK dönen veriyi farklı formatta verebilir, garanti yöntem:
    if (response && response.models) {
        response.models.forEach(model => {
            if (model.name.includes("generateContent")) { // Sadece içerik üretenleri göster
                console.log(`👉 ${model.name.replace('models/', '')}`);
            }
        });
    } else {
        // Eğer format farklıysa direkt bas
        console.log(response);
    }

  } catch (err) {
    console.error("❌ Hata:", err);
  }
}

listModels();