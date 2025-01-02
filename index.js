require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

//* Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.hl8mn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    //TODO Connect the client to the server
    // await client.connect();
    const database = client.db("ATHLETIXproductsDB");
    const allProducts = database.collection("AllProducts");

    //* Getting All Products
    app.get("/all-products", async (req, res) => {
      const cursor = allProducts.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //* Getting All Equipment Products
    app.get("/all-products/category/all-equipment", async (req, res) => {
      const cursor = allProducts.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //* Get Products By category
    app.get("/all-products/category/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = allProducts.find({ category: id });
      const result = await cursor.toArray();
      res.json(result);
    });

    //* Get Single Product By ID
    app.get("/all-products/:id", async (req, res) => {
      const id = req.params.id;
      const result = await allProducts.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    //* Get Products By UID
    app.get("/all-products/user/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = allProducts.find({ uid: id });
      const result = await cursor.toArray();
      res.json(result);
    });

    //TODO Adding a new Product
    app.post("/all-products", async (req, res) => {
      const product = req.body;
      const result = await allProducts.insertOne(product);
      res.send(result);
    });

    //TODO Update a product
    app.put("/all-products/:id", async (req, res) => {
      const id = req.params.id;
      const editedProduct = req.body;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatedProduct = {
        $set: {
          product_title: editedProduct.product_title,
          product_image: editedProduct.product_image,
          category: editedProduct.category,
          price: editedProduct.price,
          description: editedProduct.description,
          customization: editedProduct.customization,
          rating: editedProduct.rating,
          deliveryTime: editedProduct.deliveryTime,
          stockStatus: editedProduct.stockStatus,
        },
      };
      const result = await allProducts.updateOne(
        filter,
        updatedProduct,
        option
      );
      res.send(result);
    });

    //! DELETE Single Product
    app.delete("/all-products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allProducts.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pocked to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Worlds!");
});

app.listen(port);
