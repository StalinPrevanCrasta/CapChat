import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient("mongodb://localhost:27017", { useNewUrlParser: true, useUnifiedTopology: true });

let usersCollection;
let messagesCollection;

const connectToDatabase = async () => {
  if (!usersCollection) {
    console.log('Attempting to connect to MongoDB...');
    try {
      await client.connect();
      console.log('Connected to MongoDB successfully');
      const db = client.db('chatApp');
      
      // Test the connection by performing a simple operation
      await db.stats();
      console.log('Database connection verified');
      
      usersCollection = db.collection('users');
      messagesCollection = db.collection('messages');
      
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }
  return usersCollection;
};

// Message endpoints
app.get('/messages', async (req, res) => {
  try {
    if (!messagesCollection) {
      await connectToDatabase();
    }
    const allMessages = await messagesCollection.find().sort({ timestamp: -1 }).limit(50).toArray();
    res.json(allMessages.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
    console.log(error);
  }
});

app.post('/messages', async (req, res) => {
  try {
    if (!messagesCollection) {
      await connectToDatabase();
    }
    
    // Create message with proper timestamp format
    const messageData = {
      username: req.body.username,
      message: req.body.message,
      timestamp: new Date() // Create a new Date object directly on the server
    };
    
    await messagesCollection.insertOne(messageData);
    res.status(201).json({ message: 'Message sent' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Error sending message' });
  }
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    console.log('Connecting to database...');
    const users = await connectToDatabase();
    
    console.log('Checking for existing user...');
    const existingUser = await users.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Inserting new user...');
    await users.insertOne({ 
      username, 
      password: hashedPassword,
      timestamp: new Date()  // Add timestamp for user creation
    });
    
    console.log('User registered successfully');
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Detailed registration error:', error);
    res.status(500).json({ error: 'Error registering user', details: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const users = await connectToDatabase();
    const user = await users.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
    console.log(error);
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});