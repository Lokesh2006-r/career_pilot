const mongoose = require('mongoose');

const uri = 'mongodb+srv://lokeshcsengineering_db_user:%40Lokesh123%40@codedebugger.ed9kv1m.mongodb.net/student-ai-twin?retryWrites=true&w=majority&appName=codedebugger';

async function run() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to DB');
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    const targets = ['1004', '1361', '1284', '1638', 1004, 1361, 1284, 1638];
    
    for (const coll of collections) {
      const name = coll.name;
      const docs = await mongoose.connection.db.collection(name).find().toArray();
      for (const doc of docs) {
        const str = JSON.stringify(doc);
        for (const t of targets) {
          if (str.includes(t)) {
            console.log(`Found target ${t} in collection "${name}", doc ID: ${doc._id}`);
            console.log(JSON.stringify(doc, null, 2));
            console.log('----------------------------');
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
