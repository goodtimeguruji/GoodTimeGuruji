import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { runAuspiciousCheckAcrossDatesModel } from "./models/models.js";
import path from "path";
import { fileURLToPath } from "url";

// Import service handlers
import runAuspiciousCheckAcrossDates from "./services/daterangefullcheck.js";
import runAuspiciousCheckAcrossDatesDeivaPrathishta from "./services/deivaprathista.js";
import runAuspiciousCheckAcrossDatesAksharaaramba from "./services/Aksharaaramba.js";
import runAuspiciousCheckAcrossDatesAnnaprasana from "./services/Annaprasana.js";
import runAuspiciousCheckAcrossDatesInvestment from "./services/investment.js";
import runAuspiciousCheckAcrossDatesVidhyaarambha from "./services/vidhyaaramba.js";
import runAuspiciousCheckAcrossDatesPumsuvanam from "./services/Pumsuvanam.js";
import runAuspiciousCheckAcrossDatesVishnuBali from "./services/VishnuBali.js";
import runAuspiciousCheckAcrossDatesDeliveryAdmission from "./services/DeliveryAdmission.js";
import runAuspiciousCheckAcrossDatesChildCradling from "./services/ChildCradling.js";
import runAuspiciousCheckAcrossDatesHeadShave from "./services/HeadShave.js";
import runAuspiciousCheckAcrossDatesNewPortfolio from "./services/NewPortfolio.js";
import runAuspiciousCheckAcrossDatesUpanayanam from "./services/Upanayanam.js";
import runAuspiciousCheckAcrossDatesTravel from "./services/Travel.js";
import runAuspiciousCheckAcrossDatesConstruction from "./services/Construction.js";
import runAuspiciousCheckAcrossDatesGruhaPravesam from "./services/GruhaPravesam.js";
import runAuspiciousCheckAcrossDatesNilaiPadi from "./services/NilaiPadi.js";
import runAuspiciousCheckAcrossDatesVehiclePurchase from "./services/VehiclePurchase.js";
import runAuspiciousCheckAcrossDatesStartBuisiness from "./services/StartBuisiness.js";
import runAuspiciousCheckAcrossDatesTakingMedicine from "./services/TakingMedicine.js";
import runAuspiciousCheckAcrossDatesSurgery from "./services/Surgery.js";
import runAuspiciousCheckAcrossDatesArogyaSnanam from "./services/ArogyaSnanam.js";
import runAuspiciousCheckAcrossDatesOilBath from "./services/OilBath.js";
import runAuspiciousCheckAcrossDatesBhooPravesam from "./services/Bhoopravesam.js";
import runAuspiciousCheckAcrossDatesCultivation from "./services/Cultivation.js";
import runAuspiciousCheckAcrossDatesPlantingSeeds from "./services/PlantingSeeds.js";
import runAuspiciousCheckAcrossDatesCuttingGrains from "./services/CuttingGrains.js";
import runAuspiciousCheckAcrossDatesLandRegistration from "./services/LandRegistration.js";
import runAuspiciousCheckAcrossDatesExamFees from "./services/ExamFees.js";
import runAuspiciousCheckAcrossDatesProdtest from "./services/testingprod.js";
import authRoutes from "./services/authRoutes.js";

const app = express();

// 🔥 ADD CSP HERE
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://accounts.google.com https://apis.google.com; connect-src 'self' https://nominatim.openstreetmap.org http://localhost:3000 https://accounts.google.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com https://accounts.google.com; font-src 'self' https://fonts.gstatic.com https://ssl.gstatic.com; frame-src https://accounts.google.com;"
  );
  next();
});

const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔒 Security Middleware
//app.use(helmet()); 
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);// Secure headers
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.disable("x-powered-by"); // Hide Express info



// 🚦 Rate limiting (avoid brute force/abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // requests per window per IP
  message: "Too many requests, try again later."
});
app.use("/api", limiter);

// 🔐 Parse JSON safely (limit payload size)
app.use(express.json({ limit: "10kb" }));
//auth
app.use("/api/auth", authRoutes);
// 🔥 Serve frontend files
app.use(express.static(path.join(__dirname, "public")));



// ✅ Serve homepage manually
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "GoodTimeVaithi.html"));
});

// 📌 Route Setup Helper
import { verifyToken } from "./services/authMiddleware.js";

const setupRoute = (path, handler) => {
  app.post(path, verifyToken, async (req, res, next) => {
    try {
      console.log("✅ Received params:", req.body);

      const validated = runAuspiciousCheckAcrossDatesModel.parse(req.body);
      const result = await handler(
        validated.fromDateStr,
        validated.toDateStr,
        validated.userNakshatra,
        validated.userRasi,
        validated.lat,
        validated.lon,
        validated.tzone,
        validated.place
      );

      res.json(result);
    } catch (error) {
      next(error); // delegate to error handler
    }
  });
};

// 📌 Define all routes
setupRoute("/runAuspiciousCheckAcrossDates", runAuspiciousCheckAcrossDates);
setupRoute("/runAuspiciousCheckAcrossDatesDeivaPrathishta", runAuspiciousCheckAcrossDatesDeivaPrathishta);
setupRoute("/runAuspiciousCheckAcrossDatesAksharaaramba", runAuspiciousCheckAcrossDatesAksharaaramba);
setupRoute("/runAuspiciousCheckAcrossDatesAnnaprasana", runAuspiciousCheckAcrossDatesAnnaprasana);
setupRoute("/runAuspiciousCheckAcrossDatesInvestment", runAuspiciousCheckAcrossDatesInvestment);
setupRoute("/runAuspiciousCheckAcrossDatesVidhyaarambha", runAuspiciousCheckAcrossDatesVidhyaarambha);
setupRoute("/runAuspiciousCheckAcrossDatesPumsuvanam", runAuspiciousCheckAcrossDatesPumsuvanam);
setupRoute("/runAuspiciousCheckAcrossDatesVishnuBali", runAuspiciousCheckAcrossDatesVishnuBali);
setupRoute("/runAuspiciousCheckAcrossDatesDeliveryAdmission", runAuspiciousCheckAcrossDatesDeliveryAdmission);
setupRoute("/runAuspiciousCheckAcrossDatesChildCradling", runAuspiciousCheckAcrossDatesChildCradling);
setupRoute("/runAuspiciousCheckAcrossDatesHeadShave", runAuspiciousCheckAcrossDatesHeadShave);
setupRoute("/runAuspiciousCheckAcrossDatesNewPortfolio", runAuspiciousCheckAcrossDatesNewPortfolio);
setupRoute("/runAuspiciousCheckAcrossDatesUpanayanam", runAuspiciousCheckAcrossDatesUpanayanam);
setupRoute("/runAuspiciousCheckAcrossDatesTravel", runAuspiciousCheckAcrossDatesTravel);
setupRoute("/runAuspiciousCheckAcrossDatesConstruction", runAuspiciousCheckAcrossDatesConstruction);
setupRoute("/runAuspiciousCheckAcrossDatesGruhaPravesam", runAuspiciousCheckAcrossDatesGruhaPravesam);
setupRoute("/runAuspiciousCheckAcrossDatesNilaiPadi", runAuspiciousCheckAcrossDatesNilaiPadi);
setupRoute("/runAuspiciousCheckAcrossDatesVehiclePurchase", runAuspiciousCheckAcrossDatesVehiclePurchase);
setupRoute("/runAuspiciousCheckAcrossDatesStartBuisiness", runAuspiciousCheckAcrossDatesStartBuisiness);
setupRoute("/runAuspiciousCheckAcrossDatesTakingMedicine", runAuspiciousCheckAcrossDatesTakingMedicine);
setupRoute("/runAuspiciousCheckAcrossDatesSurgery", runAuspiciousCheckAcrossDatesSurgery);
setupRoute("/runAuspiciousCheckAcrossDatesArogyaSnanam", runAuspiciousCheckAcrossDatesArogyaSnanam);
setupRoute("/runAuspiciousCheckAcrossDatesOilBath", runAuspiciousCheckAcrossDatesOilBath);
setupRoute("/runAuspiciousCheckAcrossDatesBhooPravesam", runAuspiciousCheckAcrossDatesBhooPravesam);
setupRoute("/runAuspiciousCheckAcrossDatesCultivation", runAuspiciousCheckAcrossDatesCultivation);
setupRoute("/runAuspiciousCheckAcrossDatesPlantingSeeds", runAuspiciousCheckAcrossDatesPlantingSeeds);
setupRoute("/runAuspiciousCheckAcrossDatesCuttingGrains", runAuspiciousCheckAcrossDatesCuttingGrains);
setupRoute("/runAuspiciousCheckAcrossDatesLandRegistration", runAuspiciousCheckAcrossDatesLandRegistration);
setupRoute("/runAuspiciousCheckAcrossDatesExamFees", runAuspiciousCheckAcrossDatesExamFees);
setupRoute("/runAuspiciousCheckAcrossDatesProdtest", runAuspiciousCheckAcrossDatesProdtest);


// 🛡️ Centralized Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  if (err.name === "ZodError") {
    return res.status(400).json({ error: err.errors });
  }
  res.status(500).json({ error: "Internal server error" });
});

// ✅ Start server once
app.listen(PORT, () => {
  console.log(`🚀 API running at http://localhost:${PORT}`);
});
