import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config';

import User from './models/user';
let app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.get('*', (req,res) => {
// 	res.send('Hello From ES2016');
// });

app.post('/auth/signup', (req,res) => {
	const { username, password, email } = req.body;
      const current_password = bcrypt.hashSync(password, 10);

      User.forge({
        username, email, current_password
      }, { hasTimestamps: false }).save()
        .then(user => res.json({ success: true }))
        .catch(err => res.status(500).json({ error: err }));
});

app.get('/:id', (req,res) => {
	User.query({
	    select: [ 'id', 'email', 'username', 'current_password'],
	    where: { id: req.params.id },
	  }).fetch().then(user => {
	    res.json({ user });
	  });
});

app.post('/auth/login', (req,res) => {
	const { email , password } = req.body;

  User.query({
    where: { email: email }
  }).fetch().then(user => {
    if (user) {
      if (bcrypt.compareSync(password, user.get('current_password'))) {
        const token = jwt.sign({
          id: user.get('id'),
          username: user.get('username')
        }, config.jwtSecret);
        res.json({ token });
      } else {
        res.status(401).json({ errors: { form: 'Invalid Credentials' } });
      }
    } else {
      res.status(401).json({ errors: { form: 'Invalid Credentials' } });
    }
  });
});
app.listen(port, console.log("Listening on port 3000"))