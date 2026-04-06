const https = require('https');

const url = 'https://attendance-monitoring-sy-b6317-default-rtdb.firebaseio.com/.json?shallow=true';

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log("Status Code:", res.statusCode);
    console.log("Database Roots:", data);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
