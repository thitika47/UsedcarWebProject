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
    filename:(req,file,cb)=>{//Upload picture this func will change its name into date+name
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

router.get("/productManagementAddproduct",(req,res)=>{
    console.log("ProductManagementAddproduct")
    res.render('productManagementAddproduct',{title :'homepage'})
})
router.get("/team",(req,res)=>{
    console.log("TeamPage")
    res.render('team',{title :'About us'})
})
router.get("/login",(req,res)=>{
    console.log("login")
    res.render('login',{title :'homepage'})
})
router.get("/search",(req,res)=>{
    console.log("search page")
    res.render('search',{title :'homepage'})
})

router.get("/buyProduct",(req,res)=>{
    console.log("Product history")
    res.render('buyProduct')
})
router.get("/detail",(req,res)=>{
    console.log("Car detail")
    const sql = "SELECT * FROM car";

    dbcon.query(sql,(err,results)=>{
        if(err) throw err;

        res.render('detail',{
            title:'Detail',
            car: results
        })
    })

})

router.get("/productManagementHistory",(req,res)=>{
    console.log("Product history")
    res.render('productManagementHistory')
})
router.get("/productManagement",(req,res)=>{
    console.log("Product history")
    res.render('productManagement')
})

router.get("/productManagementAddproduct",(req,res)=>{
    console.log("Product history")
    res.render('productManagementAddproduct')
})
router.get("/register",(req,res)=>{
    console.log("Product history")
    res.render('register')
})

//Admin user only
router.get("/UserManagementAdduser",(req,res)=>{
    console.log("UserManagementAdduser")
    res.render('UserManagementAdduser')
})

router.get("/UserManagementEdit",(req,res)=>{
    console.log("User Edit")
    res.render('UserManagementEdit')
})

router.get("/UserManagementOverview",(req,res)=>{
    console.log("User Overview")
    res.render('UserManagementOverview')
})





router.get("/a",(req,res)=>{
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
            const insertUserQuery = 'INSERT INTO user (fname,lname,Email,Username,Password) VALUES(?,?,?,?,?)'
            dbcon.query(insertUserQuery,[fname,lname,email,username,Hashedpassword],(err,result)=>{
                if (err) throw err;
                res.render('register',{ success_msg: "Registeration succesfully"})
            })
        }
    })
});

router.post('/form-login',(req,res)=>{
  const{email,password} =req.body;
  
  const sql ='SELECT email,password FROM user WHERE email = ?'
  dbcon.query(sql,[email],(err,result)=>{
    if(err) throw err;
    console.log(result)
    if(result.length>0){
        const user = result[0];
        if(bcrypt.compareSync(password,user.password)){
            req.session.user = user;
            return res.redirect('/team');
        }else{
            res.render('login',{error_msg:'Incorrect Password'})
           
        }
    }
     else{
        res.render('login',{error_msg:'User not found'})
        
    }
    
  })
});


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
// app.get('/edit/',(req,res)=>{ 
//     const sql = "SELECT * FROM car "
//     console.log(`EDIT id `)
//     dbcon.query(sql,(err,result)=>{
//         if (err) throw err;
//         res.redirect('/edit/:carid')
//         // res.render('edit', { car: result[0] });
//     })
// })

app.get('/edit/:id',(req,res)=>{
    const sql = "SELECT * FROM car WHERE carid =?"
    console.log(`EDIT id = ${req.params.id}`)
    dbcon.query(sql,[req.params.id],(err,result)=>{
        if (err) throw err;
        res.render('edit', { car: result[0] });
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