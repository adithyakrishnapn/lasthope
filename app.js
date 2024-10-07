const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');
const db = require('./config/connections');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const { saveMessageToDatabase } = require('./helpers/chatHelper');
var fileUpload = require('express-fileupload');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware to set up socket.io on response
app.use((req, res, next) => {
  res.io = io;
  next();
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  allowProtoMethodsByDefault: true,
  allowProtoPropertiesByDefault: true,
  helpers: {
    math: function (lvalue, operator, rvalue) {
      lvalue = parseFloat(lvalue);
      rvalue = parseFloat(rvalue);
      return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue
      }[operator];
    },
    eq: function (a, b) {  // Register the 'eq' helper
      return a === b;
    },
    not: (value) => !value,
    or: function() {
      const args = Array.prototype.slice.call(arguments, 0, -1);
      return args.some(Boolean);
    }
  }
}));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(session({
  secret :"Key",
  cookie:{maxAge:60000000},
  resave: false,
  saveUninitialized: false,
}));

// Database connection
db.connect((err) => {
  if (err) {
    console.log("Error found: " + err);
  } else {
    console.log("Connected to database");
  }
});

// Routes
app.use('/', usersRouter);
app.use('/admin', adminRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Global unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Socket.io setup
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join room', (productId) => {
    socket.join(productId);
  });

  socket.on('chat message', async (msg) => {
    const { productId, userId, username, content, sendermail, receivermail, category } = msg;
    await saveMessageToDatabase({ productId, userId, username, message: content, sendermail, receivermail, category });

    // Emit the message to the specific room for the product
    io.to(productId).emit('chat message', { userId, username, content, sendermail, receivermail, category });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

module.exports = { app, server };

// regex, ux, mask