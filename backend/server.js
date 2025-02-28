import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

const app = express();
app.use(cors()); // Allow frontend access
app.use(express.json()); // Parse JSON requests

// 🔹 Use .env MONGO_URI, fallback to MongoDB Atlas URL
const MONGO_URI = process.env.MONGO_URI ;

// ✅ MongoDB Client
const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true,
    tlsAllowInvalidCertificates: false, // Prevent invalid TLS errors
});

// ✅ Connect to MongoDB
async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("✅ Successfully connected to MongoDB!");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    }
}

// ✅ Root route
app.get('/', (req, res) => {
    res.send('✨ Server is Ready! ✅');
});

// ✅ Fetch jokes from an external API
app.get('/api/jokes', async (req, res) => {
    try {
        const response = await axios.get('https://v2.jokeapi.dev/joke/Any?type=twopart&amount=10');
        const jokes = response.data.jokes.map((joke, index) => ({
            id: index + 1,
            title: joke.setup,
            content: joke.delivery,
        }));

        res.json(jokes);
    } catch (error) {
        console.error("❌ Error fetching jokes:", error);
        res.status(500).json({ error: "Failed to fetch jokes" });
    }
});

// ✅ Fetch all persons from the database
app.get('/api/persons', async (req, res) => {
    try {
        const db = client.db("INDEX");
        const personCollection = db.collection("PERSON");
        const persons = await personCollection.find({}).toArray();
        res.json(persons);
    } catch (error) {
        console.error("❌ Error fetching persons:", error);
        res.status(500).json({ error: "Failed to fetch persons" });
    }
});

// ✅ Add a person via API
app.post('/api/persons', async (req, res) => {
    try {
        const { name, marks, age, dob } = req.body;

        if (!name || !marks || !age || !dob) {
            return res.status(400).json({ error: "All fields (name, marks, age, dob) are required!" });
        }

        const db = client.db("INDEX");
        const personCollection = db.collection("PERSON");

        const newPerson = { name, marks: Number(marks), age: Number(age), dob };
        const result = await personCollection.insertOne(newPerson);

        res.json({ message: "✅ Person added successfully!", person: newPerson, id: result.insertedId });
    } catch (error) {
        console.error("❌ Error adding person:", error);
        res.status(500).json({ error: "Failed to add person" });
    }
});

// ✅ Start the Express Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    await connectToMongoDB();
});
