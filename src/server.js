// Server Dependencies
import mongoose from "mongoose";
import dotenv from "dotenv";
import { runApp, closeApp } from "./app.js";

const app = runApp();

const port = process.env.PORT || 3000;

const mongoUri =
  "mongodb+srv://mongoUser:j*e6HeYLPAM&-sZ@cluster0.rnytx.mongodb.net/?retryWrites=true&w=majority";

const connectToDatabase = function () {
  console.log("[database]: connecting to MongoDB...");
  mongoose.connect(
    mongoUri,
    {
      dbName: process.env.DB_NAME,
      autoIndex: true,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 60000,
    },
    function (err) {
      if (err) {
        // Health Route
        app.route("/api/v1/health").get(function (req, res) {
          res.status(200).json({
            success: true,
            server: "offline",
            message: "server is down due to database connection error",
          });
        });

        app.use("*", (req, res, next) => {
          res.status(500).json({
            success: false,
            server: "offline",
            message: "[server] offline due to database error",
          });
        });

        console.log(`[database]: could not connect due to [${err.message}]`);
        app.listen(port, (err) => {
          if (err) {
            console.log(
              `[server] could not start http server on port: ${port}`
            );
            return;
          }
          console.log(`[server] running on port: ${port}`);
        });

        setTimeout(connectToDatabase, 10000);
        return;
      } else {
        console.log(`[database]: connected successfully to MongoDB`);

        // Init Modules
        // initModules(app);

        // Health Route
        app.route("/api/v1/health").get(function (req, res) {
          res.status(200).json({
            success: true,
            server: "online",
            message: "server is up and running",
          });
        });

        // Error Handler
        closeApp(app);

        const server = app.listen(port, (err) => {
          if (err) {
            console.log(
              `[server] could not start http server on port: ${port}`
            );
            return;
          }
          console.log(`[server] running on port: ${port}`);
        });

        // Init Web Socket
        // initWebSocket(server);

        // Handling Uncaught Exception
        // process.on("uncaughtException", (err) => {
        //   console.log(`Error: ${err.message}`);
        //   console.log(`[server] shutting down due to Uncaught Exception`);

        //   server.close(() => {
        //     process.exit(1);
        //   });
        // });

        // // Unhandled Promise Rejection
        // process.on("unhandledRejection", (err) => {
        //   console.log(`Error: ${err.message}`);
        //   console.log(
        //     `[server] shutting down due to Unhandled Promise Rejection`
        //   );

        //   server.close(() => {
        //     process.exit(1);
        //   });
        // });
      }
    }
  );
};

// Starting Server
(async () => {
  connectToDatabase();
})();
