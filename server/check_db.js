import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/campusarena")
  .then(async () => {
    const db = mongoose.connection.db;
    const cols = await db.listCollections().toArray();
    for (let c of cols) {
      const count = await db.collection(c.name).countDocuments();
      console.log(c.name, count);
    }
    process.exit(0);
  });
