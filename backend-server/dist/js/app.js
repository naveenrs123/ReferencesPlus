"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(routes_1.default);
app.get('/', (req, res) => {
    res.sendFile("hello.html", {
        root: "src/views"
    });
});
const uri = `mongodb://${process.env.COSMOSDB_NAME}:${process.env.PRIMARY_MASTER_KEY}@${process.env.COSMOSDB_NAME}.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@${process.env.COSMOSDB_NAME}@`;
mongoose_1.default
    .connect(uri)
    .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
    .catch((error) => {
    throw error;
});
