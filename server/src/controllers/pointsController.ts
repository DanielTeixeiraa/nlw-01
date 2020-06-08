import { Request, Response } from "express";
import knex from "../database/connection";

class PointsController {
  async index(req: Request, res: Response) {
    const { city, uf, items } = req.query;

    const parsedItems = String(items)
      .split(",")
      .map((items) => Number(items.trim()));

    const pointsa = await knex("points")
      .join("points_items", "points.id", "=", "points_items.point_id")
      .whereIn("points_items.items_id", parsedItems)
      .where("city", String(city))
      .where("uf", String(uf))
      .distinct()
      .select("points.*");

      const serializedPoints = pointsa.map((points) => {
        return {
          ...points,
            image_url: `http://192.168.1.8:5000/uploads/${points.image}` 
        };
      });

    return res.json(serializedPoints);
  }

  async indexAll(req: Request, res: Response) {
    const points = await knex("points").select("*");

    const serializablePoints = points.map((point) => {
      return {
        name: point.name,
        email: point.email,
        city: point.city,
      };
    });

    res.json(serializablePoints);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const point = await knex("points").where("id", id).first();

    if (!point) {
      return res.status(400).json({ message: "Point not found" });
    }

    const serializedPoints = {
        ...point,
          image_url: `http://192.168.1.8:5000/uploads/${point.image}` 
    };

    const items = await knex("items")
      .join("points_items", "items.id", "=", "points_items.items_id")
      .where("points_items.point_id", id)
      .select("items.title");

    res.json({ point: serializedPoints, items });
  }
  async create(req: Request, res: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longtude,
      city,
      uf,
      items,
    } = req.body;

    const trx = await knex.transaction();

    const point = {
      image: req.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longtude,
      city,
      uf,
    };

    const insertedIds = await trx("points").insert(point);
    const point_id = insertedIds[0];

    const pointItems = items
      .split(",")
      .map((item: string) => Number(item.trim()))
      .map((items_id: number) => {
        return {
          items_id,
          point_id,
        };
      });

    await trx("points_items").insert(pointItems);
    await trx.commit();
    return res.json({
      id: point_id,
      ...point,
    });
  }
}

export default PointsController;
