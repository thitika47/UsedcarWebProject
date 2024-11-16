router.post('/form-login',(req,res)=>{ 
  const{username,password} =req.body;

  const sql ='SELECT * FROM user WHERE username = ?'
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
