import express from 'express';
import session from 'express-session';
import { dirname } from 'path';
import path from 'path';
import { fileURLToPath } from 'url';

import bodyParser  from 'body-parser';

import bcrypt from 'bcrypt';

let __dirname = dirname(fileURLToPath(import.meta.url));


const port = 8080;

var app = express();

app.use(session({
	secret: 'dmsnoiuwjbmxma8763k',
    resave: false,
    saveUninitialized: true,
    // 1 minute cookie
    cookie: { maxAge: 1000 * 60   }
}));

app.use(express.static('./'));  

// app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// simulate db
let users = {};


app.get('/', function(req, res) {
    if (req.session.loggedin) {
        // display name + email
        res.redirect('/dashboard');
    }
    else
    {
        // open login screen
        res.sendFile('login.html', {root: __dirname })
    }
});


app.get('/login', function(req, res) {
        res.redirect('/');
});


app.get('/dashboard', function(req, res) {
    
    if (req.session.loggedin) {
        res.send(`Hey ${req.session.username}, ${req.session.email}`);
	} else {
		res.redirect('/');
	}

});



app.post('/login', async (req, res) => {
    
    let username = req.body.username;
    let email = req.body.email;
	let password = req.body.password;
	
    if(users[email]!= undefined)
    {
        let result = await bcrypt.compare(password, users[email]['password']);
            
        if(result == true)
        {
            req.session.loggedin = true;
            req.session.username = users[email]['username'];
            req.session.email = email;

            res.redirect('/dashboard');
        }
        else
        {
            res.redirect('/');
        }
    
    }
    else if (username && email && password) 
    {
		
        req.session.loggedin = true;
        req.session.username = username;
        req.session.email = email;

        bcrypt.hash(password, 10, (err, hash) => {
            if(err)
            {
    
                res.redirect('/');
            }

            users[email] = {'username': username, 'email':email,'password':hash};
            res.redirect('/dashboard');
          });
    
    
	} else {
		
        res.redirect('/');
	}

});



app.listen(port, () => console.log(`App listening on port ${port}!`));






