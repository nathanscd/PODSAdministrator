const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
admin.initializeApp();

exports.generateReportPDF = onRequest(async (req, res) => {
  try {
    const { htmlContent, title } = req.body;
    if (!htmlContent) {
      res.status(400).send({ error: "htmlContent is required" });
      return;
    }

    res.set("Content-Type", "application/pdf");
    res.status(200).send(Buffer.from(`PDF Report: ${title || "Atlas Report"}`));
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).send({ error: error.message });
  }
});
