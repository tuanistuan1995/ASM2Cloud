var express = require("express");
var app = express();
var fs = require("fs");

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

var publicDir = require("path").join(__dirname, "/public");
app.use(express.static(publicDir));

//npm i handlebars consolidate --save
const engines = require("consolidate");
app.engine("hbs", engines.handlebars);
app.set("views", "./views");
app.set("view engine", "hbs");

var MongoClient = require("mongodb").MongoClient;
var url = "mongodb+srv://AnhTuan:vutuan113@cluster0.zptoe.mongodb.net/test";

app.get("/insert", (req, res) => {
  res.render("insert");
});

app.post("/doInsert", async (req, res) => {
  let inputProductID = req.body.txtProductID;
  let inputName = req.body.txtName;
  let inputImage = req.body.txtImage;
  let inputPrice = req.body.txtPrice;
  let inputStatus = req.body.txtStatus;
  let newProduct = {
    ID: inputProductID,
    name: inputName,
    image: inputImage,
    price: inputPrice,
    status: inputStatus,
  };
  if(inputName.length < 4 && isNaN(inputPrice)){
    let errorModel = {nameError: "Name must be greater than 3 character!!!",
                      errorMsg: "The price must be a number !!!"} ;  
    res.render('insert', {model:errorModel})
  }
  else if(inputName.length < 4) {
    let errorModel = { nameError: "Name must be greater than 3 character!!!" };
    res.render("insert", { model: errorModel });
  }
  else if(isNaN(inputPrice)) {
    let errorModel = { errorMsg: "The price must be a number !!!" };
    res.render("insert", { model: errorModel });

  }
   else {
    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    await dbo.collection("ProductDB").insert(newProduct);
    res.redirect("/");
  }
});

app.get("/", async function (req, res) {
  let client = await MongoClient.connect(url);
  let dbo = client.db("ProductDB");
  let result = await dbo.collection("ProductDB").find({}).toArray();
  res.render("index", { model: result });
});

app.get("/delete", async (req, res) => {
  let inputId = req.query.id;
  let client = await MongoClient.connect(url);
  let dbo = client.db("ProductDB");
  var ObjectID = require("mongodb").ObjectID;
  let condition = { _id: ObjectID(inputId) };
  await dbo.collection("ProductDB").deleteOne(condition);
  res.redirect("/");
});


app.post("/doSearch", async (req, res) => {
  var inputStatus = req.body.txtStatus;
  let client = await MongoClient.connect(url);
  let dbo = client.db("ProductDB");
  let result = await dbo
    .collection("ProductDB")
    .find({
      $or: [
        { name: new RegExp("^"+ inputStatus, "i") },

        { status: new RegExp("^" +inputStatus, "i") },
      ],
    })
    .toArray();
  res.render("index", { model: result });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT);
