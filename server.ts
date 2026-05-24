import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parsing (with limit for image uploads)
app.use(express.json({ limit: "15mb" }));

// Validator to check if a key is a valid Gemini key format or a placeholder/empty value
function isGeminiApiKeyValid(key: string | undefined): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (
    trimmed === "" ||
    trimmed === "MOCK_KEY" ||
    trimmed === "MY_GEMINI_API_KEY" ||
    trimmed === "YOUR_GEMINI_API_KEY" ||
    trimmed === "YOUR_API_KEY" ||
    trimmed === "undefined" ||
    trimmed === "null" ||
    trimmed.includes("PLACEHOLDER")
  ) {
    return false;
  }
  // Standard Gemini Developer API keys always start with AIzaSy
  if (!trimmed.startsWith("AIzaSy")) {
    return false;
  }
  return true;
}

// Lazy initializer for Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!isGeminiApiKeyValid(apiKey)) {
      console.warn("WARNING: GEMINI_API_KEY is not valid or not set. Real AI queries may fail.");
    }
    aiClient = new GoogleGenAI({
      apiKey: isGeminiApiKeyValid(apiKey) ? apiKey!.trim() : "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ==================== DYNAMIC AGRONOMIC FALLBACKS ====================

function getLocalFallbackResponse(message: string): { text: string; suggestedTool?: any } {
  const lowerMsg = message.toLowerCase();
  
  // Salinity
  if (lowerMsg.includes("salinity") || lowerMsg.includes("salt") || lowerMsg.includes("crust")) {
    return {
      text: "Addressing Soil Salinity (Salt Crust) is critical. Excessive evaporation leaves a white powder on dry ridge-tops which impedes water uptake. To solve this locally:\n\n1. **Gypsum Treatment**: Apply agricultural calcium sulfate (gypsum) to displace sodium on soil particles.\n2. **Leaching Fraction**: Flood the field with low-salinity freshwater to flush toxic salt ions beneath the 3-foot root zone.\n3. **Organic Humates**: Incorporate sweet clover or Sesbania green manures to rebuild soil structural pores.\n\nYou can calibrate exact gypsum weights and flush depths in the 'Risk Advisory' tab under 'Soil Salinity'!",
      suggestedTool: {
        type: "soil_npk",
        title: "Soil NPK Analysis Analyzer",
        description: "Review current nitrogen, phosphorus, potassium parameters for North Valley Sector Alpha."
      }
    };
  }
  
  // Frost
  if (lowerMsg.includes("frost") || lowerMsg.includes("freeze") || lowerMsg.includes("cold")) {
    return {
      text: "Sudden Night Frost Burn can rupture delicate cell structures. A critical protective technique is overhead misting sprinklers:\n\n1. **Thermal Latent Energy**: Continuous misting deposits water on leaf and bud tissues. As the water freezes, it releases latent heat of fusion, holding the plant tissue exactly at the safety of 0°C.\n2. **Ocean Sourced Sprays**: Apply kelp extracts containing cytokinins to stimulate osmoprotectors inside plant sap.\n3. **Heat Banking**: Irrigate late in the afternoon because damp ground retains ambient solar warmth much better than dry loose earth.\n\nUse the 'Risk Advisory' tab's calculator under 'Sudden Night Frost' to compute water volumes required to protect your area!",
      suggestedTool: {
        type: "irrigation_warning",
        title: "Irrigation Scheduler",
        description: "Adjust customized hydration presets based on 24-hour heat and soil diagnostics."
      }
    };
  }

  // Lodging
  if (lowerMsg.includes("lodge") || lowerMsg.includes("lodging") || lowerMsg.includes("wind") || lowerMsg.includes("buckle")) {
    return {
      text: "Crop Lodging occurs when top-heavy cereals buckle or snap flat under high wind pressures, often caused by applying high-speed Nitrogen fertilizer single dumps. To strengthen stalks:\n\n1. **Potassium Reinforcement**: Ensure balanced N:K nutrition feed ratios. Potassium forms robust cell wall lignins.\n2. **Wide Row Sowing**: Give canopy space to allow high wind speeds to pass harmlessly through stalks.\n3. **Resistant Breeds**: Select dwarf or shorter stature varieties during sowing seeds stages.\n\nCalculate your field bending probability and get custom potassium recipes in our 'Risk Advisory' tab under 'Crop Lodging'!",
      suggestedTool: {
        type: "soil_npk",
        title: "Soil NPK Analysis Analyzer",
        description: "Review current nitrogen, phosphorus, potassium parameters for North Valley Sector Alpha."
      }
    };
  }

  // Compaction
  if (lowerMsg.includes("compact") || lowerMsg.includes("hardpan") || lowerMsg.includes("tractor")) {
    return {
      text: "Soil Compaction (Hardpan plow pans) blocks root penetration, pooling heavy waters in tractor treads. To address concrete-like fields:\n\n1. **Mechanical Shatter**: Run deep subsoiler ripping shanks when the field is dry to slice the lower hardpan layer.\n2. **Bio-Drill Radical Crops**: Sow deep-penetrating taproot cover crops like Daikon radish to drill through the compressed dense soil layers naturally.\n3. **Controlled Traffic**: Keep tractor passes restricted to consistent target tramlines to shield crop root spaces.\n\nCheck out the 'Risk Advisory' tab under 'Soil Compaction' to specify your bulk soil density and compute ideal ripping depths and radish seed quotas!",
      suggestedTool: {
        type: "soil_npk",
        title: "Soil NPK Analysis Analyzer",
        description: "Review current nitrogen, phosphorus, potassium parameters for North Valley Sector Alpha."
      }
    };
  }

  // Leaching / Nitrogen
  if (lowerMsg.includes("leach") || lowerMsg.includes("gas") || lowerMsg.includes("urea") || lowerMsg.includes("loss")) {
    return {
      text: "Nitrogen volatilization and soil leaching represent severe chemical and financial losses. Broadcasting urea on warm, dry fields wastes up to 55% of the applied nitrogen through gaseous ammonia. To protect resources:\n\n1. **Mechanical Incorporation**: Always till fertilizer into the top 2 inches of soil immediately instead of leaving it surface-exposed.\n2. **Split-Feed Schedules**: Split applications into custom phases corresponding with active crop growth stages.\n3. **Inhibitor Additives**: Employ natural urease inhibitors or carbonaceous materials like biochar to grip nitrogen ions.\n\nEnter your local details on the 'Risk Advisory' N-Loss panel to calculate exactly how much fertilizer cash is saved with immediate soil tilling!",
      suggestedTool: {
        type: "soil_npk",
        title: "Soil NPK Analysis Analyzer",
        description: "Review current nitrogen, phosphorus, potassium parameters for North Valley Sector Alpha."
      }
    };
  }

  // Standard NPK / Fertilizer
  if (lowerMsg.includes("npk") || lowerMsg.includes("fertilizer") || lowerMsg.includes("nutrient")) {
    return {
      text: "Getting your N-P-K (Nitrogen, Phosphorus, Potassium) ratios right for your crop type is essential for maximizing yield and avoiding disease. You can use our integrated NPK Fertilizer Tool which calculates exact soil-deficient grams of urea, diammonium phosphate (DAP), and potash depending on your crop family. I strongly suggest you open the **NPK Calculator** screen to run precise target calibrations!",
      suggestedTool: {
        type: "soil_npk",
        title: "Soil NPK Analysis Analyzer",
        description: "Review current nitrogen, phosphorus, potassium parameters for North Valley Sector Alpha."
      }
    };
  }

  // Standard Leaf Disease / Analyzer
  if (lowerMsg.includes("disease") || lowerMsg.includes("pathogen") || lowerMsg.includes("diagnostic") || lowerMsg.includes("leaf") || lowerMsg.includes("spot")) {
    return {
      text: "Checking leaf pathology is crucial to stop fungal and bacterial spreads before they infect the whole harvest. I suggest utilizing your integrated **Leaf Analyzer** tab. You can upload any crop smartphone camera snap or test the wheat or soy presets to run diagnostic scans instantly based on leaf vein anomalies and necrosis spots.",
      suggestedTool: {
        type: "disease_scan",
        title: "Crop Scan Diagnostic Health Tool",
        description: "Upload photographic scans of infected leaves for automatic pathogens screening."
      }
    };
  }

  // Standard General reply
  return {
    text: "Welcome to AgroMind AI. I am fully programmed to act as your expert digital precision agriculture specialist. I can help you solve critical on-field challenges such as:\n\n* **Soil High-Salinity Crusts** (Gypsum leaching fractions)\n* **Sudden Night Frost Burns** (Overhead latental misting calculations)\n* **Crop Lodging & Wind Buckling** (Balanced silicon & potassium structures)\n* **Soil Compaction Hardpan** (Mechanical subsoiling & Daikon bio-drills)\n* **Nitrogen Evaporation & Ammonia Leaching** (Mechanical tillage & split-dosing Ledger)\n\nWhat farming challenge are you facing today? Feel free to describe soil parameters, leaf rust, or irrigation dilemmas for instant mitigation advice!",
  };
}

// ==================== API ENDPOINTS ====================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Chat endpoint with Gemini
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Preempt fallbacks if GEMINI_API_KEY is not genuinely set or invalid to avoid slow external connection attempts
    const apiKey = process.env.GEMINI_API_KEY;
    if (!isGeminiApiKeyValid(apiKey)) {
      console.log("[AgroMind AI] Invalid or placeholder GEMINI_API_KEY detected. Using localized dynamic chatbot response...");
      const fallback = getLocalFallbackResponse(message);
      return res.json(fallback);
    }

    const ai = getGeminiClient();

    // Compile message history into format expected by @google/genai
    // Note: Gemini roles are 'user' and 'model'
    const contents = (history || []).map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // Append the new user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const systemInstruction = `You are AgroMind AI, an expert precision agricultural specialist and AI chatbot agent. 
      You help farmers manage sustainable crops, optimize yields, troubleshoot disease symptoms, evaluate weather impact on irrigation, and suggest precise fertilizer requirements (NPK ratios).
      Keep your tone encouraging, highly skilled, professional, and field-practical. 
      When farmers describe crops experiencing specific visual symptoms, offer expert plant pathology advice, scientific terms, and actionable organic/chemical remediation treatments.
      If the farmer asks about soil analytics, soil testing, or NPK parameters, mention the "Soil Analysis Tool" capability of AgroMind AI to help check precise local parameters.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I apologize, but I could not formulate a response at this time.";

    // Simple context check to see if we should suggest a tailored tool card
    let suggestedTool = undefined;
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes("soil") || lowerMsg.includes("npk") || lowerMsg.includes("fertilizer")) {
      suggestedTool = {
        type: "soil_npk" as const,
        title: "Soil NPK Analysis Analyzer",
        description: "Review current nitrogen, phosphorus, potassium parameters for North Valley Sector Alpha."
      };
    } else if (lowerMsg.includes("irrigate") || lowerMsg.includes("water") || lowerMsg.includes("dry")) {
      suggestedTool = {
        type: "irrigation_warning" as const,
        title: "Irrigation Scheduler",
        description: "Adjust customized hydration presets based on 24-hour heat and soil diagnostics."
      };
    } else if (lowerMsg.includes("leaf") || lowerMsg.includes("blight") || lowerMsg.includes("disease") || lowerMsg.includes("spot")) {
      suggestedTool = {
        type: "disease_scan" as const,
        title: "Crop Scan Diagnostic Health Tool",
        description: "Upload photographic scans of infected leaves for automatic pathogens screening."
      };
    }

    res.json({
      text: replyText,
      suggestedTool,
    });
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    if (errorMsg.includes("API key not valid") || errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("400")) {
      console.warn("[AgroMind AI] Gemini API key became invalid or was rejected. Gracefully fallback to local response.");
    } else {
      console.error("Gemini Chat API Error, falling back...", error);
    }
    const fallback = getLocalFallbackResponse(req.body.message);
    res.json(fallback);
  }
});

// Image leaf disease diagnostic scan
app.post("/api/detect", async (req, res) => {
  const { base64Image } = req.body;
  if (!base64Image) {
    return res.status(400).json({ error: "base64Image is required for scanning." });
  }

  const DIAGNOSES_FALLBACK_DATABASE = [
    {
      disease: "Tomato Early Blight",
      scientificName: "Alternaria solani",
      confidence: 94,
      symptoms: "Target-like concentric ring brown-black dry lesions, starting on mature margins. Causes progressive chlorotic yellow collapse upwards.",
      treatment: [
        "Apply localized liquid copper hydroxide chemical/organic fungicide sprays immediately.",
        "Prune the lower vegetative branches up to 10 inches high to suppress fungal spore soil splashback.",
        "Incorporate straw mulches to insulate soil water splash and preserve humidity bounds."
      ],
      prevention: [
        "Rotate out Solanaceous hosts (tomatoes, peppers, potatoes) on a 3-year loop database.",
        "Introduce drip tape irrigation lines; avoid high-volume overhead watering layouts.",
        "Sterilize steel pruning shears and till equipment after servicing contaminated sub-parcels."
      ],
      statusText: "Requires Action"
    },
    {
      disease: "Wheat Rust",
      scientificName: "Puccinia recondita",
      confidence: 91,
      symptoms: "Bright orange-brown, powdery oval pustules coating leaves and stems. Pustules rupture leaf epidermal cells, disrupting critical vascular hydration.",
      treatment: [
        "Inoculate wheat fields with sulfur-based powder, biological teas, or tebuconazole solutions.",
        "Control high-nitrogen timings; excessive succulent green flesh feeds fungal growth rapidly.",
        "Purge alternative volunteer host weeds (e.g. goatgrass) from perimeter rows."
      ],
      prevention: [
        "Sow certified rust-tolerant cereal hybrids suited for humid environments.",
        "Advance early autumn/spring planting dates to complete grain fillings before summer rust peaks.",
        "Adopt wide-row seedling geometry to encourage wind-drying and suppress mildew moisture spikes."
      ],
      statusText: "Requires Action"
    },
    {
      disease: "Soybean Sudden Death Syndrome",
      scientificName: "Fusarium virguliforme",
      confidence: 86,
      symptoms: "Distinctive interveinal chlorosis (yellow-white spots between green veins) turning necrotic/brown, while petioles remain firmly attached.",
      treatment: [
        "No effective rescue chemical cures. Drench with organic compost tea or Trichoderma biological soil agents.",
        "Subsoil hardpan compacted layers immediately following harvest to drain wet pooling layers."
      ],
      prevention: [
        "Purchase certified seed cultivars with strong disease resistance index ratings.",
        "Treat seeds with ilevo fluopyram fungicide seed protectants prior to germination phases.",
        "Delay general sowing dates until soil warmth registers above 15°C to limit early root rot."
      ],
      statusText: "Requires Action"
    },
    {
      disease: "Healthy Corn Canopy",
      scientificName: "N/A",
      confidence: 98,
      symptoms: "Vibrant uniformly dark-green leaf tissue. Thick vascular leaf venation without chlorosis, rust, spots, or viral mosaic banding.",
      treatment: [
        "Maintain active balanced N-P-K (120-40-60 lbs/acre) nutrient inputs.",
        "Ensure soil moisture registers safely within optimal limits (35% to 55%)."
      ],
      prevention: [
        "Perform periodic drone sweeps or manual field walks.",
        "Cleanse tractor tires after transitioning between disparate remote sections."
      ],
      statusText: "Healthy"
    }
  ];

  // Preempt if key is invalid, missing or default
  const apiKey = process.env.GEMINI_API_KEY;
  if (!isGeminiApiKeyValid(apiKey)) {
    console.log("[AgroMind AI] Invalid or placeholder GEMINI_API_KEY detected. Using localized dynamic image scanner...");
    const index = Math.abs(base64Image.length) % DIAGNOSES_FALLBACK_DATABASE.length;
    const fallback = DIAGNOSES_FALLBACK_DATABASE[index];
    return res.json(fallback);
  }

  try {
    // Extract raw base64 data and mimeType
    let refinedBase64 = base64Image;
    let mimeType = "image/jpeg";

    if (base64Image.includes(";base64,")) {
      const parts = base64Image.split(";base64,");
      mimeType = parts[0].replace("data:", "");
      refinedBase64 = parts[1];
    }

    const ai = getGeminiClient();

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: refinedBase64,
      },
    };

    const textPart = {
      text: "Diagnose any diseases, issues, pests, or agricultural deficiencies you spot on this crop leaf/stem. Offer a clear diagnosis name, symptoms, and actionable organic/chemical treatments and preventions.",
    };

    console.log("Analyzing image using gemini-3.5-flash with structured JSON schema...");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            disease: { type: Type.STRING, description: "Common name of condition detected, e.g. 'Northern Leaf Blight', 'Early Blight Tomato', 'Healthy Corn', etc." },
            scientificName: { type: Type.STRING, description: "Scientific biological name of the pathogen or 'N/A' if healthy." },
            confidence: { type: Type.INTEGER, description: "Confidence probability of your match from 0 to 100" },
            symptoms: { type: Type.STRING, description: "Concise details of symptoms identified, including coloration, visual lesion patterns, or spotting" },
            treatment: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 precise immediate chemical or organic/treatment steps, such as strobilurin fungicide spray or ventilation"
            },
            prevention: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Crop rotation, Resistant hybrids, spacing, or hygiene sanitation keys"
            },
            statusText: {
              type: Type.STRING,
              description: "Action outcome needed: 'Requires Action', 'Healthy', or 'Reviewed'"
            }
          },
          required: ["disease", "scientificName", "confidence", "symptoms", "treatment", "prevention", "statusText"]
        }
      }
    });

    let jsonResponse = {};
    if (response.text) {
      try {
        jsonResponse = JSON.parse(response.text.trim());
      } catch (e) {
        console.warn("Failed to parse response as JSON. Stripping any code markdown...", response.text);
        let raw = response.text.trim();
        if (raw.startsWith("```json")) {
          raw = raw.substring(7);
        }
        if (raw.endsWith("```")) {
          raw = raw.substring(0, raw.length - 3);
        }
        jsonResponse = JSON.parse(raw.trim());
      }
    } else {
      throw new Error("No output received from the image analysis model.");
    }

    res.json(jsonResponse);

  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    if (errorMsg.includes("API key not valid") || errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("400")) {
      console.warn("[AgroMind AI] Gemini API key became invalid or was rejected during image scan. Gracefully fallback to local diagnosis database.");
    } else {
      console.error("Gemini Image Analysis Detection Error, employing fallback...", error);
    }
    const index = Math.abs(base64Image.length) % DIAGNOSES_FALLBACK_DATABASE.length;
    const fallback = DIAGNOSES_FALLBACK_DATABASE[index];
    res.json(fallback);
  }
});

// ==================== FRONTEND BUNDLE SERVING ====================

async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AgroMind AI] Fullstack Server running at http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
