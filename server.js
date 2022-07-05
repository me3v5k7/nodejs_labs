const express = require("express");
const livereload = require("livereload");
const connect_livereload = require("connect-livereload");
const fs = require("fs");
const body_parser = require('body-parser')
const multer = require("multer");
const { waitForDebugger } = require("inspector");

const public_directory =__dirname + "/public";
const json_db_filepath = __dirname + "/json/db.json";

let livereload_server = livereload.createServer();

livereload_server.watch(public_directory);

let app = new express();

app.use(connect_livereload());
app.use(body_parser.json())
app.use(body_parser.urlencoded({ extended: true }))

app.use(express.static("public"));
app.set("view engine", "pug");


let profile_images_storage = multer.diskStorage({  
    destination: function (req, file, callback) {  
        callback(null, "./public/src/profile_images");  
    },  
    filename: function (req, file, callback) {  
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, uniqueSuffix + "-" + file.originalname);
    }  
});  

let profile_images_upload = multer({ storage : profile_images_storage}).single("profile_image");  

const port = 8080;
app.listen(port, function() {
    console.log("Server started at localhost:" + port);
});

app.get("/hello", function(req, res) {
    //res.send("<h1>Test</h1>");
    let title = req.query.name;
    res.render('index', {title:`what, ${title}`, message:"lol"})
});

app.post("/api/get_profile_info", function(req, res){
    let json_db = JSON.parse(loadData(json_db_filepath));
    let responce_key = searchFirstResultJSON(json_db.users, "id", req.body.id);
    if (responce_key){
        res.send(json_db.users[responce_key]);
    }
    else {
        res.send(`{"responce" : "false"}`);
    }
});



app.post("/api/set_profile_image", function(req, res){
    profile_images_upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            return res.end("Error uploading file in mutler.");  
        }
        else if(err) {  
            return res.end("Error uploading file.");  
        }
        let json_db = JSON.parse(loadData(json_db_filepath));
        let key = searchFirstResultJSON(json_db.users, "id", req.body.profile_id);

        if (json_db.users[key].image_url !== ""){
            let filepath = __dirname + ("/public" + json_db.users[key].image_url)
            checkFileExists(filepath).then(function(bool) {
                if (bool){
                    fs.unlink(filepath, function(err){
                        if (err){
                            console.log(err);
                        }
                        
                    });
                } 
            });
        }

        if(req.file){
            json_db.users[key].image_url = "/src/profile_images/" + req.file.filename;
            
        }
        else {
            json_db.users[key].image_url = "";
        }
        saveData(json_db_filepath, JSON.stringify(json_db));
        res.end(`{"result" : "sucsess"}`);
    });
});

function changeProfileImage(profile_id, image_url){
    let json_db = JSON.parse(loadData(json_db_filepath));
    json_db.users[profile_id].image_url = "/src/profile_images/" + image_url;
    saveData(json_db_filepath, JSON.stringify(json_db));
}

app.post("/api/set_profile_name", function(req, res){
    let json_db = JSON.parse(loadData(json_db_filepath));
    let key = searchFirstResultJSON(json_db.users, "id", req.body.profile_id);
    json_db.users[key].name = req.body.profile_name;

    saveData(json_db_filepath, JSON.stringify(json_db));
    res.send(`{"result" : "sucsess"}`);
});

function changeProfileName(profile_id, new_name){
    let json_db = JSON.parse(loadData(json_db_filepath));
    json_db.users[profile_id].name = new_name;
    saveData(json_db_filepath, JSON.stringify(json_db));
}

app.post("/api/set_profile_work_name", function(req, res){
    let json_db = JSON.parse(loadData(json_db_filepath));
    let key = searchFirstResultJSON(json_db.users, "id", req.body.profile_id);
    json_db.users[key].proffesion = req.body.profile_work_name;

    saveData(json_db_filepath, JSON.stringify(json_db));
    res.send(`{"result" : "sucsess"}`);
});

function changeProfileProffesion(profile_id, new_name){
    let json_db = JSON.parse(loadData(json_db_filepath));
    json_db.users[profile_id].proffesion = new_name;
    saveData(json_db_filepath, JSON.stringify(json_db));
}

app.post("/api/create_profile", function(req, res){
    let json_profile_template = {"id":"","name":"None","proffesion":"None","image_url":"","entries":[/* entries_here */]};
    let json_db = JSON.parse(loadData(json_db_filepath));
    let new_id = searchMaxIntResultJSON(json_db.users, "id") + 1;
    json_profile_template.id = new_id.toString()
    json_db.users.push(json_profile_template);
    saveData(json_db_filepath, JSON.stringify(json_db));
    res.send(JSON.stringify({"new_id" : new_id.toString()}));
});

function createProfile(){
    let json_profile_template = {"id":"","name":"None","proffesion":"None","image_url":"","entries":[/* entries_here */]};
    let json_db = JSON.parse(loadData(json_db_filepath));
    let new_id = searchMaxIntResultJSON(json_db.users, "id") + 1;
    json_profile_template.id = new_id.toString()
    json_db.users.push(json_profile_template);
    saveData(json_db_filepath, JSON.stringify(json_db));
    return new_id;
}

function deleteProfile(id_to_delete){
    let json_db = JSON.parse(loadData(json_db_filepath));
    json_db.users.pop(id_to_delete);
    saveData(json_db_filepath, JSON.stringify(json_db));
}

app.post("/api/get_profiles", function(req, res){
    let json_db = JSON.parse(loadData(json_db_filepath));

    res.send(JSON.stringify(json_db.users));
});

app.post("/api/delete_register_entry", function(req, res){
    let json_db = JSON.parse(loadData(json_db_filepath));
    json_db.users[req.body.profile_id].entries.pop([parseInt(req.body.entry_id)])
    
    saveData(json_db_filepath, JSON.stringify(json_db));
    res.send();
});

function deleteRegisterEntry(profile_id, entry_id){
    let json_db = JSON.parse(loadData(json_db_filepath));
    json_db.users[profile_id].entries.pop([parseInt(entry_id)])
    
    saveData(json_db_filepath, JSON.stringify(json_db));
}


app.post("/api/add_register_entry", function(req, res){
    let json_db = JSON.parse(loadData(json_db_filepath));
    let current_date = new Date();
    json_db.users[req.body.profile_id].entries.push({"date" : `${current_date.getDate()}.${current_date.getMonth() + 1}.${current_date.getFullYear()}`, "text" : req.body.text});
    
    saveData(json_db_filepath, JSON.stringify(json_db));
    res.send();
});

function addRegisterEntry(profile_id, entry_text){
    let json_db = JSON.parse(loadData(json_db_filepath));
    let current_date = new Date();
    json_db.users[profile_id].entries.push({"date" : `${current_date.getDate()}.${current_date.getMonth() + 1}.${current_date.getFullYear()}`, "text" : entry_text});
    
    saveData(json_db_filepath, JSON.stringify(json_db));
}

//data utilities
const loadData = function(path){
    try {
         return fs.readFileSync(path, 'utf8')
    } catch (err) {
        console.error(err)
        return false
    }
};

const saveData = function(path, file){
    try {
        return fs.writeFileSync(path, file, 'utf8')
   } catch (err) {
       return false
   }
};

const searchFirstResultJSON = function(json, where, is){
    for (let key in json) {
        if (json[key][where] === is) {
            return key;
        }
    }
    return false;
};

const searchMaxIntResultJSON = function(json, where){
    let result = undefined;
    for (let key in json) {
        if (result < parseInt(json[key][where]) || result === undefined){
            result = parseInt(json[key][where])
        }
    }
    return result;
};

function checkFileExists(file) {
    return fs.promises.access(file, fs.constants.F_OK)
             .then(() => true)
             .catch(() => false)
}