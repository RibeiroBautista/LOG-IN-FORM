const express = require("express");
const routesApi = require("./routes/indexApiRoutes").router;
const routesProdTest = require("./routes/productosTest").router;
const path = require("path");
const ChatContainer = require("./Chat");
const { contenedorProductos } = require("./controllers/apiController");
const { Server: IOServer } = require("socket.io");
const normalizeMensajes = require("../util/normalize");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");

const mongoStoreOptions = { useNewUrlParser: true, useUnifiedTopology: true };

const chat = new ChatContainer("chats", {
    author: {
        id: { type: String, required: true },
        nombre: { type: String, required: true },
        apellido: { type: String, required: true },
        edad: { type: Number, required: true },
        alias: { type: String, required: true },
        avatar: { type: String, required: true }
    },
    text: { type: String, required: true }
});


const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cookieParser());
app.use(session({
    store: MongoStore.create({
        mongoUrl:
            "",//<---- Ingrese base de datos de mongo dentro de las comillas porfavor
        mongoStoreOptions,
    }),
    secret: "coderproject",
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000
    },
    rolling: true
}));

app.use(express.static(path.join(__dirname, "../public")));

function auth(req, res, next) {
    if (req.session.admin === true) {
        next();
    } else {
        res.status(401).json({ status: 401, code: "no credentials" });
    };
};

app.get("/logged", (req, res) => {
    if (req.session.admin === true) {
        res.json({ status: "ok", user: req.session.user });
    } else {
        res.status(401).json({ status: 401, code: "no credentials" });
    }
});

app.get("/session-test", (req, res) => {
    if (req.session.contador) {
        req.session.contador++;
        return res.send("visitas: " + req.session.contador);
    } else {
        req.session.contador = 1;
        res.send("esta es tu primera visita");
    }
});

app.get("/login", (req, res) => {
    const { username } = req.query;
    req.session.user = username;
    req.session.admin = true;

    res.json({ status: 'ok', user: req.session.user });
});

app.get("/logout", (req, res) => {
    const user = req.session.user;
    req.session.destroy(err => {
        if (err) {
            res.status(500).json({ status: "error", body: err });
        } else {
            res.json({ status: "ok", user });
        }
    });
});

app.use("/api/productos", auth, routesApi);
app.use("/api/productos-test", auth, routesProdTest);

app.use((req, res) => {
    res.status(404).json({ error404: "Ruta no encontrada" });
});

app.use(function (err, req, res, next) {
    res.status(500).json({
        error: err.message,
    });
});

const expressServer = app.listen(port, (err) => {
    if (!err) {
        console.log(`El servidor se inicio en el puerto ${port}`);
    } else {
        console.log(`Hubo un error al iniciar el servidor: `, err);
    }
});

const io = new IOServer(expressServer);

io.on("connection", async socket => {
    console.log("Nuevo usuario conectado");

    const mensajes = await chat.getAll();
    const normalizedMensajes = normalizeMensajes(mensajes);

    socket.emit("server:items-test", { productos: [], mensajes: normalizedMensajes });


    socket.on("client: producto", async producto => {
        await contenedorProductos.save(producto);

        io.emit("server:producto", producto);
    });

    socket.on("client:mensaje", async mensajeEnvio => {
        const savedMessage = await chat.save(mensajeEnvio);
        io.emit("server:mensaje", savedMessage);
    });
});

