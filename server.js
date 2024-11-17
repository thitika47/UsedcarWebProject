const express = require('express')
const path =require('path');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const router = express.Router();
const bodyParser = require('body-parser'); 

const bcrypt = require('bcryptjs');
const session = require('express-session');
const multer = require('multer')

const app=express();
app.use(express.json()); 
app.use(router);

//Keep the picture
const storage = multer.diskStorage({
    destination: (req,file,cb)=>{//Where pic got kept
        cb(null, 'public/uploads/');
    },
    filename:(req,file,cb)=>{//Upload picture this func will change its name into date+.jpg for example
        cb(null,Date.now()+path.extname(file.originalname)) 
    }
})
const upload = multer({ storage });

//Set ejs as template engine
app.set('view engine','ejs');


//middleware
router.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
//Static file
app.use(express.static(path.join(__dirname,'public')))
router.use(session({
    secret: 'nodesecret',
    resave: false,
    saveUninitialized:true
}))

//Middleware to check if the user is login
function isAuthencicated(req,res,next){
    if(req.session.user){
        return next();
    }else{
        res.redirect('/login')
    }
}

function ifLoggedin(req,res,next){
    if(req.session.user){
        return res.redirect("/")
    }
    next();
}


//Create Sql connection
dotenv.config()
var dbcon = mysql.createConnection({
    host: process.env.DB_host,
    user:process.env.DB_user,
    password:process.env.DB_pass,
    database:process.env.DB_name
})

router.get("/",(req,res)=>{
    console.log("Homepage")
    res.render('home',{title :'homepage'})
})

router.get("/team",(req,res)=>{
    console.log("TeamPage")
    res.render('team',{title :'About us'})
})
router.get("/login",ifLoggedin,(req,res)=>{
    console.log("login")
    res.render('login',{title :'homepage'})
})
router.get("/register",ifLoggedin,(req,res)=>{
    console.log("Product history")
    res.render('register')
})

router.get("/search",(req,res)=>{
    console.log("search page")
    res.render('search',{title :'homepage'})
})

router.get("/detail",isAuthencicated,(req,res)=>{
    console.log(req.session.user)
    const sql = "SELECT * FROM car";

    dbcon.query(sql,(err,results)=>{
        if(err) throw err;

        res.render('detail',{
            title:'Detail',
            car: results,
            user: req.session.user 
        })
    })

})

router.get("/productManagementHistory",isAuthencicated,(req,res)=>{
    console.log("Product history")
    const sql = "SELECT * FROM car";
    dbcon.query(sql,(err,results)=>{
        if(err) throw err;
        
        res.render('productManagementHistory',{
            car: results
        })
    })
})
router.get("/productManagement",isAuthencicated,(req,res)=>{
    console.log("Product history")
    res.render('productManagement')
})

router.get("/productManagementAddproduct",isAuthencicated,(req,res)=>{
    console.log("Product history")
    res.render('productManagementAddproduct')
})


//Admin user only
router.get("/UserManagementAdduser",isAuthencicated,(req,res)=>{
    console.log("UserManagementAdduser")
    res.render('UserManagementAdduser')
})

router.get("/UserManagementEdit",isAuthencicated,(req,res)=>{
    console.log("User Edit")
    res.render('UserManagementEdit')
})

router.get("/UserManagementOverview",isAuthencicated,(req,res)=>{
    console.log("User Overview")
    const sql = "SELECT * FROM user";
    dbcon.query(sql,(err,results)=>{
        if(err) throw err;
        
        res.render('UserManagementOverview',{
            user: results
        })
    })
})





router.get("/a",(req,res)=>{ //Checked
    const sql = `SELECT * FROM Car`;
    dbcon.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query failed' });
        }
    res.json(results);
    })
})
router.get("/form-search", (req, res) => { 
    console.log("Query params:", req.query);
    const model = req.query.search;  
    if (!model) {
        return res.redirect('/detail')
    }
    console.log(`Finding car with model: ${model}`);
    
    const sql = `SELECT * FROM Car WHERE model = ?`;
    dbcon.query(sql, [model], (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).send("Error querying the database");
        }

        console.log(`${results.length} row(s) returned`);

        if (results.length === 0) {
            console.log("Car not found");
            return res.status(404).send("Car not found");
        } else {
            console.log(`Found car: ${results[0].Model}`);  
        }
        res.render('detail',{
            car: results
        })
    });
});






//POST Routes
router.post('/form-register',(req,res)=>{
    const{fname,lname,email,username,password} = req.body;

    const checkEmailQuery = `SELECT * FROM User WHERE Email=?` //Check mail in databases
    dbcon.query(checkEmailQuery,[email],(err,results)=>{
        if(err) throw err;

        if (results.length >0){//Email already have
            res.render('register',{ error_msg: "Email already registered. Please use a different Email"})
        }else{
            const hashedPassword = bcrypt.hashSync(password,10);
            const insertUserQuery = 'INSERT INTO user (fname,lname,email,username,password) VALUES(?,?,?,?,?)'
            dbcon.query(insertUserQuery,[fname,lname,email,username,hashedPassword],(err,result)=>{
                if (err) throw err;
                res.render('register',{ success_msg: "Registeration succesfully"})
            })
        }
    })
});

router.post('/form-login',(req,res)=>{ 
  const{username,password} =req.body;

  const sql ='SELECT username,password,email FROM user WHERE username = ?' //can't change it * also nav
  dbcon.query(sql,[username],(err,result)=>{
    if(err) throw err;
    console.log(result)
    if(result.length>0){
        const user = result[0];
        if(bcrypt.compareSync(password,user.password)|| password ==user.password){//อันแรกจากregis อันสองปิดจุดdatabase
            req.session.user = user;
            return res.redirect('/detail');
        }else{
            console.log("wrong")
            res.render('login',{error_msg:'Incorrect Password'})
        }
    }
     else{
        console.log("No user")
        res.render('login',{error_msg:'User not found'})
    }
  })
});



// router.post('/form-login', (req, res) => {
//     const { username, password } = req.body;
  
//     const sql = 'SELECT * FROM user WHERE username = ?';
//     dbcon.query(sql, [username], (err, result) => {
//       if (err) throw err;
  
//       console.log(result); // Check what the query returns
  
//       if (result.length > 0) {
//         const user = result[0];
  
//         // Check password: hashed comparison or direct comparison for non-hashed
//         if (bcrypt.compareSync(password, user.password) || password === user.password) {
//           req.session.user = user; // Store user information in the session
//           return res.redirect('/detail');
//         } else {
//           console.log("Incorrect password");
//           res.render('login', { error_msg: 'Incorrect Password' });
//         }
//       } else {
//         console.log("User not found");
//         res.render('login', { error_msg: 'User not found' });
//       }
//     });
//   });

router.get('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('/')
})

app.post('/create',upload.single('image'),(req,res)=>{
    const{cartype,brand,model,mileage,year,description,carcondition,fuel,insurance,price} = req.body
    const image =req.file ? req.file.filename : null // Check if file upload then assign filename to image | else null

    const sql = "INSERT INTO Car (cartype,brand,model,mileage,year,description,carcondition,fuel,insurance,price,image) VALUES (?,?,?,?,?,?,?,?,?,?,?) "
    dbcon.query(sql,[cartype,brand,model,mileage,year,description,carcondition,fuel,insurance,price,image],(err,result)=>{
        if(err) throw err;
        res.redirect('/')
    })
})

//edit car info

app.get('/edit/:id',(req,res)=>{
    const sql = "SELECT * FROM car WHERE carid =?"
    console.log(`EDIT id = ${req.params.id}`)
    dbcon.query(sql,[req.params.id],(err,result)=>{
        if (err) throw err;
        res.render('edit', { car: result[0] });
    })
})

app.post('/edit/:id'), upload.single('image') ,(req,res)=>{ //car condition HTML issue //not finished
    const{cartype,brand,model,mileage,year,description,fuel,insurance,price} = req.body
    const image =req.file ? req.file.filename : req.body.oldImage

    const sql="UPDATE car SET cartype = ? ,brand = ? ,model = ?,mileage = ?,year = ?,description = ?,fuel = ?,insurance = ?,price = ?,image = ? WHERE carid=?";
    dbcon.query(sql,[cartype,brand,model,mileage,year,description,fuel,insurance,price,image,req.params.id],(err,result)=>{
        if(err) throw(err);
        res.redirect('/detail');
})
}

router.get('/delete/:id', (req, res) => { //For WEB SERVICE
    const sql = "DELETE FROM car WHERE carid =?";
    dbcon.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.redirect('/detail');
    });
})


router.delete('/delete/:id',(req,res)=>{ //For postman
    const {id} = req.params;
    const sql = `DELETE FROM car WHERE carid =?`;
    dbcon.query(sql,[id],(err,results)=>{
        if(err) throw err;
        if(results.affectedRows===0){
            return res.status(404).send({error :"Record not found"})
        }
        res.send({message:"Record deleted successfully"})
    })
})
//Connect Databases
dbcon.connect(err=>{
    if(err) throw err;
    console.log(`Connected DB: ${process.env.DB_name}`);
 });
//Create server
app.listen(process.env.PORT,function() {
    console.log("Server listening at Port"+process.env.PORT)
})

// module.exports =router