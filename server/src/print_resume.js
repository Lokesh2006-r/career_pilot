const mongoose = require('mongoose');

const uri = 'mongodb+srv://lokeshcsengineering_db_user:%40Lokesh123%40@codedebugger.ed9kv1m.mongodb.net/student-ai-twin?retryWrites=true&w=majority&appName=codedebugger';

async function run() {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const doc = await db.collection('resumes').findOne({ userId: 'test-user' });
    if (doc) {
      console.log('--- FULL RAW TEXT OF RESUME ---');
      console.log(doc.rawText);
      console.log('--------------------------------');
    } else {
      console.log('Resume not found for test-user');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
