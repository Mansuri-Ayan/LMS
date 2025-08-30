/** @format */

import { app } from "./app";
import { connectDB } from "./utils/db";

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("server is working on PORT => ", PORT);
  connectDB();
});
