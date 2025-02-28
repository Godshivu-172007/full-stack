import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is missing! Check your .env file.");
    process.exit(1);
}

const client = new MongoClient(MONGO_URI, { tls: true });

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

// ✅ Function to prompt user input
function promptUser(question) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// ✅ Function to collect and insert person data
async function collectAndInsertPerson() {
    try {
        console.log("\n📌 Enter new person details:");
        const name = await promptUser("Enter name: ");
        const marks = await promptUser("Enter marks: ");
        const age = await promptUser("Enter age: ");
        const dob = await promptUser("Enter Date of Birth (YYYY-MM-DD): ");

        if (!name || !marks || !age || !dob) {
            console.log("❌ Error: All fields are required!");
            return;
        }

        const newPerson = { 
            name, 
            marks: Number(marks), 
            age: Number(age), 
            dob 
        };

        const db = client.db("INDEX");
        const personCollection = db.collection("PERSON");

        const result = await personCollection.insertOne(newPerson);
        console.log(`✅ Person added successfully! ID: ${result.insertedId}`);
    } catch (error) {
        console.error("❌ Error adding person:", error);
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

    // ✅ Ask user to input data after server starts
    await collectAndInsertPerson();
});
