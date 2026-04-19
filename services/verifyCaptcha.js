import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

const client = new RecaptchaEnterpriseServiceClient();

export const verifyCaptcha = async (req, res, next) => {
  try {
    const token = req.body.token;

    if (!token) {
      return res.status(400).json({ message: "Captcha token missing" });
    }

    const projectID = "goodtimeguruji-491009";

    // ✅ FIX 1: Use real site key
    const recaptchaKey = "6LeLJL4sAAAAALSqbioODckXsMfSyi_ZTshk0ZDD";

    // ✅ FIX 2: Match frontend action dynamically
    const recaptchaAction = req.path.includes("signup") ? "signup" : "login";

    const projectPath = client.projectPath(projectID);

    const request = {
      assessment: {
        event: {
          token: token,
          siteKey: recaptchaKey,
        },
      },
      parent: projectPath,
    };

    const [response] = await client.createAssessment(request);

    // ❌ Invalid token
    if (!response.tokenProperties.valid) {
      return res.status(403).json({
        message: "Invalid captcha",
        reason: response.tokenProperties.invalidReason,
      });
    }

    // ❌ Action mismatch
    if (response.tokenProperties.action !== recaptchaAction) {
      return res.status(403).json({
        message: "Captcha action mismatch",
      });
    }

    // ✅ Score check
    const score = response.riskAnalysis.score;

    if (score < 0.5) {
      return res.status(403).json({
        message: "Captcha verification failed (low score)",
      });
    }

    next();

  } catch (err) {
    console.error("Captcha error:", err);
    res.status(500).json({ message: "Captcha verification error" });
  }
};