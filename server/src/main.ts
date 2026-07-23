import express from "express";
import webhookRoute from "./routes/webhookRoute";

const app = express();

app.use(express.json());

app.use("/api/webhook", webhookRoute);

app.post("/api/test-receiver", (req, res) => {
  console.log("Webhook received:");
  console.log(req.body);

  res.status(200).json({
    success: true,
    message: "Webhook received successfully",
  });
});

export default app;
