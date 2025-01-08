require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 5000;

//* Middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

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
    const users = database.collection("users");

    //?? JWT AUTH APIS // JWT AUTH APIS
    //?? JWT AUTH APIS // JWT AUTH APIS

    //!! Auth API JWT
    app.post("/jwt", (req, res) => {
      const data = req.body;
      const token = jwt.sign(data, process.env.TOKEN_SECRET, {
        expiresIn: "5h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });

    //!! Auth API JWT Logout
    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });

    //?? PRODUCT APIS // PRODUCT APIS
    //?? PRODUCT APIS // PRODUCT APIS

    //** Get All Products
    app.get("/all-products", async (req, res) => {
      const cursor = allProducts.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //** Get Single Product By ID
    app.get("/all-products/:id", async (req, res) => {
      const id = req.params.id;
      const result = await allProducts.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    //** Get Products By UID
    app.get("/all-products/user/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = allProducts.find({ uid: id });
      const result = await cursor.toArray();
      res.json(result);
    });

    //** Adding a new Product
    app.post("/all-products", async (req, res) => {
      const product = req.body;
      const result = await allProducts.insertOne(product);
      res.send(result);
    });

    //** Update a product
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

    //** DELETE Single Product
    app.delete("/all-products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allProducts.deleteOne(query);
      res.send(result);
    });

    //?? USER APIS // USER APIS
    //?? USER APIS // USER APIS

    //%% Adding a new User
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user.email);
      const query = { uid: user.uid };
      const isUserExist = await users.findOne(query);
      if (isUserExist) {
        return res.send({ Message: "Welcome Back", insertedId: null });
      }
      const result = await users.insertOne(user);
      res.send(result);
    });

    //%% Update a User
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const editedUser = req.body;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatedUser = {
        $set: {
          DisplayName: editedUser.product_title,
        },
      };
      const result = await allProducts.updateOne(filter, updatedUser, option);
      res.send(result);
    });

    //%% DELETE Single Product
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await users.deleteOne(query);
      res.send(result);
    });

    //// Check Server
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
