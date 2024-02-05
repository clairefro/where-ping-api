const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_PROJECT_URL,
  process.env.SUPABASE_API_KEY,
);

const app = express();

app.use(express.json());

const SECRET_TOKEN = process.env.SECRET_TOKEN;

// - MIDDLEWARE---------
const validateToken = (req, res, next) => {
  const token = req.headers.authorization;

  // Check if the Authorization header is present
  if (!token) {
    return res.status(401).json({ message: "Missing Bearer token" });
  }

  // Validate the token
  if (token !== `Bearer ${SECRET_TOKEN}` || !SECRET_TOKEN) {
    return res.status(401).json({ message: "Invalid Bearer token" });
  }

  next();
};

const validateRequestBody = (req, res, next) => {
  const expectedKeys = ["city", "region", "country", "loc", "timezone"];

  const reqBodyKeys = Object.keys(req.body);

  // Check if all expected keys are present in the request body
  const missingKeys = expectedKeys.filter((key) => !reqBodyKeys.includes(key));

  if (missingKeys.length > 0) {
    return res.status(400).json({
      message: `Missing keys in request body: ${missingKeys.join(", ")}`,
    });
  }

  // If all checks pass, continue processing
  next();
};

// - ROUTES------------

app.get("/", (_req, res) => {
  res.send("OK");
});

app.post("/ping", validateToken, validateRequestBody, (req, res) => {
  console.log(new Date());
  const { loc, city, region, country, timezone } = req.body;

  const coords = loc.split(",");

  const lat = parseFloat(coords[0]);
  const lon = parseFloat(coords[1]);

  const data = {
    city,
    region,
    country,
    lat,
    lon,
    timezone,
  };

  // Insert data into the table
  supabase
    .from("pings")
    .insert([data])
    .then((_response) => {
      res.send("OK");
    })
    .catch((error) => {
      console.error("Error inserting data:", error);
      res.status(500).send({ message: "Couldn't write ping to db" });
    });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
