const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const path = require("path");
const axios = require("axios");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;

let db = null;
MongoClient.connect(process.env.MONGO_URL, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log(err);
  }
  db = client.db("crudapp");
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "/public")));
app.use("/upload", express.static(path.join(__dirname, "/upload")));
app.set("port", process.env.PORT || 8099);
const PORT = app.get("port");
app.use(cors());

app.get("/", (req, res) => {
  db.collection("dushuhui")
    .find()
    .sort({ _id: -1 })
    .toArray((err, result) => {
      res.render("index", { list: result });
    });
});

app.post("/register", (req, res) => {
  const title = req.body.title;
  const member = req.body.member;
  const reviewTxt = req.body.reviewTxt;
  db.collection("review").insertOne({
    title: title,
    member: member,
    reviewTxt: reviewTxt,
  });
  db.collection("review")
    .find()
    .sort({ _id: -1 })
    .toArray((err, result) => {
      res.json({ review: result });
    });
});
app.get("/search", (req, res) => {
  db.collection("dushuhui")
    .find()
    .sort({ _id: -1 })
    .toArray((err, result) => {
      res.render("search", { list: result });
    });
  // res.redirect("/search");
});
app.get("/search/:keyword", (req, res) => {
  const queryTxt = encodeURIComponent(req.params.keyword);
  axios({
    url: `https://openapi.naver.com/v1/search/book.json?query=${queryTxt}`,
    headers: {
      "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET,
    },
  })
    .then(function (response) {
      console.log(response);
      res.json({ result: response.data });
    }) //resolve
    .catch(function (error) {
      console.log(error);
    }); //reject
});

app.post("/add", (req, res) => {
  const imgSrc = req.body.imgSrc;
  const title = req.body.title;
  const author = req.body.author;
  const desc = req.body.desc;
  const link = req.body.link;
  db.collection("dushuhui").insertOne({
    imgSrc: imgSrc,
    title: title,
    author: author,
    desc: desc,
    link: link,
  });
  db.collection("dushuhui")
    .find()
    .sort({ _id: -1 })
    .toArray((err, result) => {
      res.json({ list: result });
    });
});

app.listen(PORT, () => {
  console.log(`${PORT}에서 서버 대기중`);
});
