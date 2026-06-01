const mongoose = require('mongoose');

const uri = 'mongodb+srv://lokeshcsengineering_db_user:%40Lokesh123%40@codedebugger.ed9kv1m.mongodb.net/student-ai-twin?retryWrites=true&w=majority&appName=codedebugger';

async function run() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to DB');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    for (const coll of collections) {
      const name = coll.name;
      const count = await mongoose.connection.db.collection(name).countDocuments();
      console.log(`Collection ${name}: ${count} documents`);
      if (count > 0) {
        const docs = await mongoose.connection.db.collection(name).find().limit(5).toArray();
        console.log(`Sample from ${name}:`, JSON.stringify(docs, null, 2));
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
