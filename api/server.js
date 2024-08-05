 const express = require('express');
const app= express();
const mysql =require('mysql2');
const cors =require('cors');
const bcrypt =require('bcrypt');
const dotenv = require('dotenv');


app.use(express.json())
app.use(cors()) 
dotenv.config()

const db =mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'Emily*19',
})

db.connect((err) =>{
     if (err) return console.log("Error connecting to MYSQL")

        console.log("Connected to MySQL : ", db.threadId);

    //create a database
   db.query('CREATE DATABASE IF NOT EXISTS expense_tracker',(err, result)=>{
             if (err) return console.log(err)

            console.log("Database expense_tracker created/checked")

        //select our database
        db.changeUser({database: 'expense_tracker' }, (err) =>{
                    if (err) return console.log(err)

                     console.log("changed to expense_tracker")
            
                       // create users tables
                      const createUsersTable = `
                     CREATE TABLE IF NOT EXISTS users (
                          id INT AUTO_INCREMENT PRIMARY KEY,
                          email VARCHAR(100) NOT NULL UNIQUE,
                          username VARCHAR(50) NOT NULL,
                          password VARCHAR(255) NOT NULL
                      );
                  `;
                  

       db.query(createUsersTable, (err, result)=>{
         if (err) return console.log(err)

         console.log("users table checked/created");
})
      })
    })

})

//user registration route
app.post('/api/register', async(req, res) => {
    try{
        const users = `SELECT * FROM users WHERE email = ?`
        //check if user exists
    db.query(users, [req.body.email],(err, data) => {
        if(data.length > 0) return res.status(409).json("User already exists");
            
        //hashing password
            const salt = bcrypt.genSaltSync(10)
            const hashedPassword = bcrypt.hashSync(req.body.password, salt)

        const newUser ='INSERT INTO users(email, username, password) VALUES(?)'
        value =[ req.body.email, req.body.username, hashedPassword]

        db.query(newUser, [value], (err, data) =>{
            if(err) return res.status(400).json("something went wrong")

                return res.status(200).json("user created successfully")
        })
    })

    }
    catch(err)  {
           res.status(500).json("Internal Server Error")
 }
})

//user login route
app.post('/api/login', async(req, res)=>{
    try{
        const users = 'SELECT * FROM users WHERE email = ?'
        db.query(users, [req.body.email], (err, data) =>{
            if(data.length === 0) return res.status(404).json("User not found!")
               

            const isPasswordValid = bcyrpt.compareSyc(req.body.password, data[0].password)
        
            if (!isPasswordValid) return res.status(400).json("Invalid email or password")

                return res.sendStatus(200).json("Login successful")
        
        })

    }
    catch(err) {
        res.status(500).json("Internal Server Error")

}
})
                

app.listen(3000, () => {
    console.log("server is running on PORT 3000")
})