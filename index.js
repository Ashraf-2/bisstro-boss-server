const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

const port = process.env.PORT || 5000;


//middlewear
app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER)
// console.log(process.env.DB_PASS)

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bx5otjq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    //database and collections 
    // const BistroBossDB = client.db("bistroBossDB");
    // const menuCL = database.collection("menu");
    // const reviewsCL = database.collection("reviewsCL");
    const menuCollection = client.db("bistroBossDB").collection("menu");
    const reviewsCollection = client.db("bistroBossDB").collection("reviewsCL");
    const cartsCollection = client.db("bistroBossDB").collection("cartsCL");


    //menu get

    app.get('/menu', async (req, res) => {
      try {
        const result = await menuCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    })

    // reviews get
    app.get('/reviews', async (req, res) => {
      try {
        const result = await reviewsCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    })

    app.get('/carts', async (req, res) => {
      try {
        const email = req.query.email;
        const query = {email: email};
        const result = await cartsCollection.find(query).toArray();   //quary for searching based on client site query-search
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    })

    app.post('/carts', async (req, res) => {
      const cartItem = req.body;
      console.log(cartItem);
      const result = await cartsCollection.insertOne(cartItem);
      res.send(result);
    })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('bistro boss server is running');
})

app.listen(port, () => {
  console.log(`bistroo boss server is running on port: ${port}`)
})