import { Router } from "express";
import * as Menu from "../controllers/menus";

const menuRoutes: Router = Router();

menuRoutes.get("/menu", Menu.getMenus);
menuRoutes.post("/menu", Menu.addMenu);
menuRoutes.put("/menu/:id", Menu.updateMenu);
menuRoutes.delete("/menu/:id", Menu.deleteMenu);
menuRoutes.get("/menu/:id", Menu.retrieveMenu);

export default menuRoutes;