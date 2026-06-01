const mongoose = require('mongoose');

const uri = 'mongodb+srv://lokeshcsengineering_db_user:%40Lokesh123%40@codedebugger.ed9kv1m.mongodb.net/student-ai-twin?retryWrites=true&w=majority&appName=codedebugger';

async function run() {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const docs = await db.collection('chats').find().toArray();
    console.log('--- CHAT HISTORY ---');
    for (const doc of docs) {
      console.log(`Chat ID: ${doc._id}, User: ${doc.userId}`);
      for (const msg of doc.messages || []) {
        console.log(`[${msg.role}] ${msg.content}`);
      }
      console.log('====================');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
