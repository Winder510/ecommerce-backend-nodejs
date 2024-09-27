import app from "./src/app.js";
import 'dotenv/config'


const PORT = process.env.PORT;

const server = app.listen(8000 || PORT, () => {
  console.log(`Example app listening on port 3000`);
});

process.on("SIGINT", () => {
  server.close(() => console.log("Server is close !!"));
});

/*
docker run --name test-docker-ecommerc -p 3000:3000 ecommerc-shop:1.0.0
docker ps 
docker build -t ecommerc-shop-test:1.0.0 .
docker rm 586
docker stop 586
*/