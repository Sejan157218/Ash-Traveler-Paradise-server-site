const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.57jms.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        await client.connect();
        const database = client.db("ashtourism");
        const placesCollection = database.collection("places");
        const ordersCollection = database.collection("orders");


        // create a document to insert
        app.post("/places", async (req, res) => {
            const places = req.body;
            const result = await placesCollection.insertOne(places);
            res.json(result);
        })

        // get places
        app.get("/places", async (req, res) => {
            const cursor = await placesCollection.find({}).toArray();
            res.send(cursor);
        })

        // get places by id
        app.get("/places/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await placesCollection.findOne(query);
            res.send(result);
        })
        // create a document to insert
        app.post("/order/:id", async (req, res) => {
            const id = req.params.id
            const body = req.body;
            const query = { _id: ObjectId(id) };
            const resultfind = await placesCollection.findOne(query);
            body.name = resultfind.name;
            body.img = resultfind.img;
            body.desc = resultfind.desc;
            body.price = resultfind.price;
            body.status = 'pending';
            const result = await ordersCollection.insertOne(body);
            res.json(result);
        })

        // get order all
        app.get("/orders", async (req, res) => {
            const cursor = await ordersCollection.find({}).toArray();
            res.send(cursor);
        })

        // delete order
        app.delete("/orders/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query)
            res.json(result);
        })

        // get my order
        app.get("/orders/:email", async (req, res) => {
            const email = req.params.email;
            const filter = { email: { $regex: email } }
            const cursor = await ordersCollection.find(filter).toArray();
            res.send(cursor);
        })


        // delete my order
        app.delete("/orders/:email/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query)
            res.json(result);
        })

        // Update my order
        app.put("/orders/updatestatus", async (req, res) => {
            const body = req.body;
            const query = { _id: ObjectId(body.id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: body.status
                },
            };
            const result = await ordersCollection.updateOne(query, updateDoc, options);
            res.json(result);
        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Ash tourism is running`, port)
})