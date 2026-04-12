require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const propertyRoutes = require("./routes/propertyRoutes");
app.use("/api/properties", propertyRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});