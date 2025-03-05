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
    origin: ["http://localhost:5173", "https://athletix-1.web.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// //!! Token Middleware local Storage
// const verifyToken = (req, res, next) => {
//   console.log("Authorization Header:", req.headers.authorization);

//   if (!req.headers.authorization) {
//     return res.status(401).send({ message: "Forbidden Access" });
//   }
//   const token = req.headers.authorization.split(" ")[1];
//   if (!token) {
//     return res.status(401).send({ message: "Forbidden Access" });
//   }
//   jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).send({ message: "Unauthorized Access" });
//     }
//     req.decoded = decoded;
//     next();
//   });
// };

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
    const cartItems = database.collection("cartItems");

    //?? ADMIN APIS // ADMIN APIS
    //?? ADMIN APIS // ADMIN APIS

    // !! isAdmin API
    // app.get("user/admin/:uid", verifyToken, async (req, res) => {
    //   const uid = req.params.uid;
    //   if (uid !== req.decoded.uid) {
    //     return res.status(403).send({ message: "Unauthorized Access" });
    //   }
    //   const query = { uid: uid };
    //   const user = await users.findOne(query);
    //   let admin = false;
    //   if (user) {
    //     admin = user?.userRole === "admin";
    //   }
    //   res.send({ admin });
    // });

    //?? JWT AUTH APIS // JWT AUTH APIS
    //?? JWT AUTH APIS // JWT AUTH APIS

    //!! Auth API JWT
    // app.post("/jwt", async (req, res) => {
    //   const data = req.body;
    //   const token = jwt.sign(data, process.env.TOKEN_SECRET, {
    //     expiresIn: "5h",
    //   });
    //   res.send({ token });
    // });
    // for cookie
    // res
    //   .cookie("token", token, {
    //     httpOnly: true,
    //     secure: false,
    //   })
    //   .send({ success: true });

    // //!! Auth API JWT Logout
    // app.post("/logout", (req, res) => {
    //   res
    //     .clearCookie("token", {
    //       httpOnly: true,
    //       secure: false,
    //     })
    //     .send({ success: true });
    // });

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

    //?? CART APIS // CART APIS
    //?? CART APIS // CART APIS

    //$$ Add To Cart API
    app.post("/cart", async (req, res) => {
      const cartData = req.body;
      const cursor = { uid: cartData.uid };
      const isUserExist = await cartItems.findOne(cursor);
      if (isUserExist) {
        const productID = cartData.productID; // is ok getting product id
        const itemExist = isUserExist.products.some(
          (i) => i.productID == productID
        );
        if (itemExist) {
          await cartItems.updateOne(
            { uid: cartData.uid, "products.productID": productID },
            { $inc: { "products.$.qty": 1 } }
          );
          return res.json({
            success: true,
            message: "Product already in cart",
          });
        } else {
          const product = { productID: cartData.productID, qty: 1 };
          cartItems.updateOne(
            { uid: cartData.uid },
            {
              $push: { products: product },
            }
          );
        }

        return res.json({ success: true, message: "Product added to cart" });
      }
      const cartDetails = {
        uid: cartData.uid,
        products: [{ productID: cartData.productID, qty: 1 }],
      };
      const result = await cartItems.insertOne(cartDetails);
      res.send(result);
    });

    //$$ Get Cart Qty
    app.put("/cart/update-qty", async (req, res) => {
      try {
        const { uid, productID, qty } = req.body;

        if (!uid || !productID || qty === undefined) {
          return res
            .status(400)
            .json({ success: false, message: "Missing required fields" });
        }

        // Ensure qty is a valid number and greater than zero
        const newQty = parseInt(qty);
        if (isNaN(newQty) || newQty < 1) {
          return res
            .status(400)
            .json({ success: false, message: "Quantity must be at least 1" });
        }

        const cart = await cartItems.findOne({ uid });

        if (!cart) {
          return res
            .status(404)
            .json({ success: false, message: "Cart not found" });
        }

        const itemExist = cart.products.some((i) => i.productID === productID);

        if (!itemExist) {
          return res
            .status(404)
            .json({ success: false, message: "Product not found in cart" });
        }

        // Update the quantity of the specific product
        const updateResult = await cartItems.updateOne(
          { uid, "products.productID": productID },
          { $set: { "products.$.qty": newQty } }
        );

        if (updateResult.modifiedCount === 0) {
          return res
            .status(500)
            .json({ success: false, message: "Failed to update quantity" });
        }

        res.json({
          success: true,
          message: "Product quantity updated successfully",
        });
      } catch (error) {
        console.error("Error updating cart item quantity:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
    });

    //$$ Get Cart Item by UID
    app.get("/cart_items/:uid", async (req, res) => {
      try {
        const { uid } = req.params;

        const cart = await cartItems.findOne({ uid: uid });

        if (!cart) {
          return res.status(404).json({ message: "Add Some Products to Cart" });
        }

        const productIDs = cart.products.map(
          (item) => new ObjectId(item.productID)
        );

        const products = await allProducts
          .aggregate([
            { $match: { _id: { $in: productIDs } } },
            {
              $project: {
                _id: 1,
                product_title: 1,
                price: {
                  $toDouble: {
                    $getField: { field: "price", input: "$$ROOT" },
                  },
                },
                stockStatus: {
                  $toInt: {
                    $getField: { field: "stockStatus", input: "$$ROOT" },
                  },
                },
              },
            },
          ])
          .toArray();

        // Rename this variable to avoid conflict
        const formattedCartItems = cart.products
          .map((item) => {
            const product = products.find(
              (p) => p._id.toString() === item.productID
            );
            return product
              ? {
                  id: product._id,
                  name: product.product_title,
                  price: product.price,
                  qty: Number(item.qty.$numberInt || item.qty),
                  stockStatus: product.stockStatus,
                }
              : null;
          })
          .filter(Boolean);

        res.json(formattedCartItems);
      } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // app.get("/cart/:uid", async (req, res) => {
    //   const uid = req.params.uid;
    //   const cursor = { uid: uid };
    //   const result = await cartItems.find(cursor).toArray();
    //   res.send(result);
    // });

    //?? USER APIS // USER APIS
    //?? USER APIS // USER APIS

    //%% Adding a new User
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { uid: user.uid };
      const isUserExist = await users.findOne(query);
      if (isUserExist) {
        return res.send({ Message: "Welcome Back", insertedId: null });
      }
      const result = await users.insertOne(user);
      res.send(result);
    });

    //%% Get All User
    app.get("/users", async (req, res) => {
      const cursor = users.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //%% Get a User
    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      const result = await users.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    //%% Update a User
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const editedUser = req.body;
      const filter = { uid: id };
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
