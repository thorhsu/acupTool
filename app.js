// var mongodbUri = "mongodb://username:password@127.0.0.1/local?authSource=admin";
var mongodbUri = "mongodb://thorhsu:12sqh38j@ds149743.mlab.com:49743/members";
var collectionName = "login";
var Db = require("./db");
var db = new Db(mongodbUri,collectionName);

var express = require("express");
var bodyParser = require("body-parser");
var session = require("express-session");
var path = require("path");
var app = express();
app.set("view engine", "ejs");
app.use(bodyParser());
app.use(session({
    secret: "abcabcabcabc"
}));
app.get("/*",function(req,res,next) {


    var pages = [/login.html/i, /style.css/i, /error.html/i];
    var notcheck = pages.some(function(page) {
        return page.test(req.path);
    });
    if (req.session["login"] || notcheck) {
    // if (req.session["login"]) {
        next(); 
    } else {
        res.redirect("/login.html");
    }
});
app.use(express.static(path.join(__dirname,"public")));
app.get("/",function(req,res) {
    res.render("index",{isLogin:req.session["login"]});
});
app.post("/",function(req,res) {
    var userid = req.body.userid;
    var password = req.body.password;
    db.select({userid:userid,password:password},function(data){
        if(data.length===1) {
            req.session["login"]=true;
            res.redirect("/acupToolhtml");
        } else {
            res.render("error",{message:"帳號密碼錯誤"}); 
        }
    },function(err) {
        console.log(err);
    });
});
app.get("/logout",function(req,res){
    req.session.destroy();
    res.redirect("/");
});
app.listen(process.env.PORT || 3000);