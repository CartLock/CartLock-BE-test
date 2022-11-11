import "babel-polyfill";
import express, { Request, Response, NextFunction, Router } from "express";
import * as http from "http";
import compression from "compression";
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";
import schedule from "node-schedule";
import axios from "axios";
import path from "path";
import fs from "fs";
import * as https from "https";

// let upload = multer();
// import swaggerUi from "swagger-ui-express"
// import * as swaggerDocument from "../swagger.json"

/****************************
 *    Route goes here       *
 ****************************/
import UserRoutes from "./routes/userRoutes";
import DeviceRoutes from "./routes/deviceRoutes";
import AdminRoutes from "./routes/admin/adminRoutes";
import ApiRoutes from "./routes/apiRoutes";
import "./util/middleware/connection";
//require("./util/middleware/connection");
/****************************
 *  Controller goes here    *
 ****************************/

class Server {
  constructor() {
    this.app = express();
    this.middleware();
    this.config();
    this.routes();
    //connection();
    this.errHandler();
    // this.app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }

  //Configuration Goes here
  config() {
    this.app.set("port", process.env.PORT || 3000);
    this.app.set("httpsport", process.env.HTTPSPORT || 8443);
    //set the mime type as json
    this.app.use(express.json());
    //parsing the client data
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(bodyParser.urlencoded({ extended: true}));
    // for parsing application/xwww-
    this.app.use(bodyParser.urlencoded({extended:true}));
    this.app.use(bodyParser.json());
    // for parsing multipart/form-data
    // this.app.use(upload.array());
    this.app.use(express.static("public"));
    //form-urlencoded
    this.app.use(compression());
  }
  //Middleware
  middleware() {
    this.app.use(cors());
  }
  //Routes initialisation
  routes() {
    this.app.get("/", (req, res) => {
      //res.sendFile(path.join(__dirname + "/index.html"));
      res.send("Welcome To LockCart");
      //__dirname : It will resolve to your project folder.
    });

    //##############:- APP API -:##########################################
    this.app.use("/api/user", UserRoutes.router);
    this.app.use("/api/device", DeviceRoutes.router);
    this.app.use("/api/support", ApiRoutes.router);

    //##############:- ADMIN API -:##########################################
    this.app.use("/admin/user", AdminRoutes.router);
    this.app.use("/admin/company", AdminRoutes.router);
    this.app.use("/admin/deviceGroup", AdminRoutes.router);
    this.app.use("/admin/support", AdminRoutes.router);
    this.app.use("/admin/settings", AdminRoutes.router);
    this.app.use("/admin/ota", AdminRoutes.router);
  }

  //Start Servers
  start() {
    //setting view engine
    this.app.set("views", path.join(__dirname, "views"));
    this.app.set("view engine", "ejs");

    const httpServer = http.createServer(this.app);
    //const httpsServer = https.createServer(credentials, app);
    httpServer.listen(this.app.get("port"), () => {
      console.log(
        "API is running at http://localhost:%d",
        this.app.get("port")
      );
    });

    //https
    /*const credentials = {
      pfx: fs.readFileSync(path.resolve(__dirname, "./ssl/private.pfx")),
      passphrase: ''
    };
    const httpsServer = https.createServer(credentials, this.app);
    httpsServer.listen(this.app.get("httpsport"), () => {
      console.log("API is running at http://localhost:%d",this.app.get("httpsport"));
    });
    */
  }

  //Error handler function
  errHandler() {
    this.app.use((err, req, res, next) => {
      //console.log(err);
      res.status(401).json({ status: 0, message: err.message });
      //res.send(err.message);
    });
  }
}

const server = new Server();
server.start();
