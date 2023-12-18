const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');

//middlewear
app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER)
// console.log(process.env.DB_PASS)

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const userCollection = client.db("bistroBossDB").collection("user");
    const menuCollection = client.db("bistroBossDB").collection("menu");
    const reviewsCollection = client.db("bistroBossDB").collection("reviewsCL");
    const cartsCollection = client.db("bistroBossDB").collection("cartsCL");

    //JWT related api
    app.post('/jwt', async (req, res) => {
      try {
        const user = req.body;      //this is payload
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '4h' });
        res.send({ token })
      } catch (error) {
        console.log(error)
      }
    })


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
    
    //carts related crud operation
    app.get('/carts', async (req, res) => {
      try {
        const email = req.query.email;
        const query = { email: email };
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

    //cart item delete
    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartsCollection.deleteOne(query);
      res.send(result);
    })

    //MiddleWears - to varify token 
    const varifyToken = (req,res, next)=> {
      console.log('inside verified token: ',req.headers);
      if(!req.headers.authorization){
        return res.status(401).send({message: 'forbidden-access'})
      }
      const token = req.headers.authorization.split(' ')[1];    //use your brain to know the functionality of this line :) 😊 
      if(!token)
      next();
    }

    //user related crud operation
    app.get('/users', varifyToken, async (req, res) => {
      try {
        const result = await userCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      //insert user if the user does not exist
      const query = { email: user.email }
      //you can do this in 3 ways. ex 1.unique email, 2. upser 3. simple checking.
      const existUser = await userCollection.findOne(query);
      if (existUser) {
        return res.send({ message: "sorry, user already registered to the database.", insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    app.delete('/users/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await userCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error)
      }
    })

    //to make change user roll and admin roll
    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }

      const result = await userCollection.updateOne(filter, updatedDoc);
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