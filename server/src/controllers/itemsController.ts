import {Request, Response} from "express";
import knex from "../database/connection";

class ItemsController{
  async index(req:Request, res:Response){
    const items = await knex("items").select("*");

    const serializadItems = items.map((items) => {
      return {
        id: items.id,
        title: items.title,
        image_url: `http://192.168.1.7:5000/uploads/${items.image}`,
      };
    });
  
    return res.json(serializadItems);
  }
}
export default ItemsController;