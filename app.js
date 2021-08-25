const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-aditya:aditya-616@cluster0.zx9uv.mongodb.net/todolistDB", {
  useNewUrlParser: true,
});

const itemSchema = {
  name: String,
};
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to do list",
});
const item2 = new Item({
  name: "Hit + icon to add more",
});
const item3 = new Item({
  name: "<-- To delete an item",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema],
};
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, itemsFound) {
    if (itemsFound.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Inserted Successfully");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: itemsFound });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName

  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log(err);
      } else {
        console.log("deleted succ");
      }
    });
    res.redirect("/");
  }
  else
  {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkedItemId}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/"+listName)
      }
    })  //remove an element of array (items) from list(listname)
  }
  
});

app.get("/:customListName", function (req, res) {
  // epress routing params
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName, //create one having default items
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started ");
});
