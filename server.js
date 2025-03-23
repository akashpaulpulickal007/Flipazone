 const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');  // Added for handling cross-origin requests

const app = express();
const port = 5000;  // Change this to 5000 or your desired port

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS middleware to allow requests from the frontend
app.use(cors());

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // your MySQL username
    password: 'Krishna@123',  // your MySQL password
    database: 'glam',  // your database name
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to the database');
});

// Registration Route
app.post('/register', (req, res) => {
    const { fullname, email, password } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send('Error hashing password');
        }

        // Prepare the SQL query
        const sql = 'INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)';
        db.query(sql, [fullname, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).send({ message: 'Email already exists' });
                }
                return res.status(500).send({ message: 'Error registering user' });
            }
            res.send({ message: 'Registration successful! Please log in' });
        });
    });
});

// Login Route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // SQL query to find user by email
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Database error' });
        }

        if (result.length === 0) {
            return res.status(400).send({ message: 'Email not found' });
        }

        const user = result[0];

        // Compare the password with the stored hash
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).send({ message: 'Error comparing passwords' });
            }

            if (!isMatch) {
                return res.status(400).send({ message: 'Invalid credentials' });
            }

            // Send success message if login is successful
            res.send({ message: 'Login successful' });
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

