const {query} = require('./src/config/db.js'); 
query('SELECT * FROM airports').then(res => { 
  console.log(res.find(r => r.name.toLowerCase().includes("maarten") || r.name.toLowerCase().includes("juliana") || r.name.toLowerCase().includes("sxm"))); 
  process.exit(0); 
}).catch(console.error);
