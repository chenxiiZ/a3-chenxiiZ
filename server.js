require('dotenv').config();

const express = require("express"),
      { MongoClient, ObjectId } = require("mongodb"),
      app = express();

app.use(express.static("public"));
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@${process.env.HOST}`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const path = require('path');

let collection = null;

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    collection = client.db("a3-database").collection("To-do-list");

    // Route to get all tasks
    app.get("/docs", async (req, res) => {
      try {
        const docs = await collection.find({}).toArray();
        res.json(docs);  // Send the tasks back to the client as JSON
      } catch (err) {
        console.error("Error fetching tasks:", err);
        res.status(500).json({ error: "Failed to fetch tasks" });
      }
    });

    // Route to submit a new task
    app.post("/submit", async (req, res) => {
      try {
        const result = await collection.insertOne(req.body);
        const docs = await collection.find({}).toArray(); // Get updated list
        res.json(docs);
      } catch (err) {
        console.error("Error submitting task:", err);
        res.status(500).json({ error: "Failed to submit task" });
      }
    });

    // Route to delete a task
    app.post("/delete", async (req, res) => {
      try {
        const result = await collection.deleteOne({ task: req.body.task });
        const docs = await collection.find({}).toArray(); // Get updated list
        res.json(docs);
      } catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).json({ error: "Failed to delete task" });
      }
    });

  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

run();

// Middleware to ensure MongoDB is connected
app.use((req, res, next) => {
  if (collection !== null) {
    next();
  } else {
    res.status(503).send("Service Unavailable: Database not connected");
  }
});

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Start the server
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
