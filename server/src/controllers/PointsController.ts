import { Request, Response } from "express";
import knex from "../database/connection";

class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    const parsedItems = String(items)
      .split(",")
      .map((item) => Number(item.trim()));

    const points = await knex("points")
      .join("point_items", "points.id", "=", "points_items.point_id")
      .whereIn("point_item.item_id", parsedItems)
      .where("city", String(city))
      .where("uf", String(uf))
      .distinct()
      .select("points.*");

    const serialzedPoints = points.map((point) => {
      return {
        ...point,
        image_url: `http://192.168.0.3:3333/upload/${point.image}`,
      };
    });

    return response.json(serialzedPoints);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex("points").where("id", id).first();

    if (!point) {
      return response.status(400).json({ message: "Point not found." });
    }

    const serialzedPoints = {
      ...point,
      image_url: `http://192.168.0.3:3333/upload/${point.image}`,
    };

    const items = await knex("items")
      .join("point_items", "item.id", "=", "point_items.item_id")
      .where("point_items.point_id", id)
      .select("items.title");

    return response.json({ point: serialzedPoints, items });
  }

  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;

    const trx = await knex.transaction();

    const point = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };

    const insertedIds = await trx("points").insert(point);

    const point_id = insertedIds[0];

    const poinItems = items
      .split(",")
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
        return {
          item_id,
          point_id,
        };
      });

    await trx("point_items").insert(poinItems);

    await trx.commit();

    return response.json({
      id: point_id,
      ...point,
    });
  }
}

export default PointsController;
