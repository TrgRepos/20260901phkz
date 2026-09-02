import express from "express";
import cors from "cors";
import routeRoutes from "./routes/route.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/routes", routeRoutes);

const PORT = process.env.PORT ?? 4000;

// Only start listening when this file is run directly (not when imported by tests).
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`routewise-ops API listening on port ${PORT}`);
  });
}

export default app;
