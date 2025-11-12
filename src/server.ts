import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { phones } from "./data/phone";
import { reviews } from "./data/review";
import { Collection, Document, MongoClient, ServerApiVersion } from 'mongodb';
import { getDB,connectPhone ,connectReview} from "./db";

// = require('mongodb');
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });



const app = express();
app.use(cors());
app.use(bodyParser.json());

// let db: any;


// async function run() {
//   try {
//     await client.connect();
//     db = client.db("PhoneList");
//     console.log(db)

//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     await client.close();
//   }
// }
// run()


const getAverageRating = (phoneId: number) => {
  
  const related = reviews.filter((r) => r.phoneId === phoneId);
  if (related.length === 0) return 0;
  const sum = related.reduce((acc, r) => acc + r.rating, 0);
  return Number((sum / related.length).toFixed(1));
};

// 📱 GET all phones with optional filters (name, brand, rating, price)
app.get("/phones",async (req, res) => {
  let filtered = [...phones];
  // let DBPhone = await connectPhone();
  // DBPhone = DBPhone.find({}).toArray();
    //  let filtered = [...await DBPhone];

  //  console.log(await DBPhone);
  // const db = getDB();
  // console.log(db);
  // const phoneCollection = db.collection("phones").find({}).toArray();
  // console.log(phoneCollection)
  // let data = await phoneCollection.find().toArray();
  // console.log(data )
  const { name, brand, rating, price_gte, price_lte } = req.query;

  if (name) filtered = filtered.filter((p) =>
    p.phoneName.toLowerCase().includes(String(name).toLowerCase())
  );
  if (brand) filtered = filtered.filter((p) =>
    p.brand.toLowerCase().includes(String(brand).toLowerCase())
  );
  if (rating) filtered = filtered.filter(
    (p) => getAverageRating(p.id) >= Number(rating)
  );
  if (price_gte) filtered = filtered.filter(
    (p) => p.price >= Number(price_gte)
  );
  if (price_lte) filtered = filtered.filter(
    (p) => p.price <= Number(price_lte)
  );

  // Attach live rating
  const result = filtered.map((p) => ({
    ...p,
    rating: getAverageRating(p.id),
  }));

  res.json(result);
});

// 🔍 GET phone by ID
app.get("/phones/:id", (req, res) => {
  const id = Number(req.params.id);
  const phone = phones.find((p) => p.id === id);
  if (!phone) return res.status(404).json({ error: "Phone not found" });

  const phoneReviews = reviews.filter((r) => r.phoneId === id);
  const avgRating = getAverageRating(id);
// reviews: phoneReviews
  res.json({ ...phone, rating: avgRating });
});

// ✏️ UPDATE phone description / stock
app.put("/phones/:id", (req, res) => {
  const id = Number(req.params.id);
  const phone = phones.find((p) => p.id === id);
  if (!phone) return res.status(404).json({ error: "Phone not found" });
   console.log( req.body);
  const { price, description, inStock } = req.body;
  if (price !== undefined) phone.price = price;
  if (description !== undefined) phone.description = description;
  if (inStock !== undefined) phone.inStock = inStock;
  console.log(phone);
  res.json({ message: "Phone updated", phone });
});

// 💬 CREATE new review
app.post("/reviews", (req, res) => {
  const { phoneId, rating, description, uid } = req.body;
  if (!phoneId || !rating || !description || !uid)
    return res.status(400).json({ error: "Missing required fields" });

  const phoneExists = phones.some((p) => p.id === Number(phoneId));
  if (!phoneExists)
    return res.status(404).json({ error: "Phone not found" });

  const newReview = {
    id: Date.now(),
    phoneId: Number(phoneId),
    rating: Number(rating),
    description,
    uid,
  };
  reviews.push(newReview);
  res.status(201).json({ message: "Review added", review: newReview });
  
});


app.get("/reviews", (req, res) => {

  res.json( [...reviews]);
});


app.get("/reviews/:id", (req, res) => {
  const id = Number(req.params.id);
  const review = reviews.find((p) => p.phoneId === id);
  console.log(review);
  if (!review) return res.status(404).json({ error: "Phone not found" });
 const phoneReviews = reviews.filter((r) => r.phoneId === id);

//   const { description, inStock } = req.body;
//   if (description !== undefined) phone.description = description;
//   if (inStock !== undefined) phone.inStock = inStock;

  res.json(phoneReviews);
});

// ✅ Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
