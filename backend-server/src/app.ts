import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import menuRoutes from "./routes";
import path from "path";

const app = express();

const PORT: string | number = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(menuRoutes);

app.get('/', (req, res) => {
  res.sendFile("hello.html", {
    root: "src/views"
  });
});

const uri = `mongodb://${process.env.COSMOSDB_NAME}:${process.env.PRIMARY_MASTER_KEY}@${process.env.COSMOSDB_NAME}.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@${process.env.COSMOSDB_NAME}@`

mongoose
  .connect(uri)
  .then(() =>
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    )
  )
  .catch((error) => {
    throw error;
  });