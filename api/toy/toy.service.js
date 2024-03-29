import mongodb from "mongodb"
const { ObjectId } = mongodb

import { dbService } from "../../services/db.service.js"
import { logger } from "../../services/logger.service.js"
import { utilService } from "../../services/util.service.js"

export const toyService = {
  remove,
  query,
  getById,
  add,
  update,
  addToyMsg,
  removeToyMsg,
}

// async function query(filterBy = {}) {
//   try {
//     const criteria = {
//       name: { $regex: filterBy.txt, $options: "i" },
//     }
//     const collection = await dbService.getCollection("toy")
//     var toys = await collection.find(criteria).toArray()
//     return toys
//   } catch (err) {
//     logger.error("cannot find toys", err)
//     throw err
//   }
// }

async function query(filterBy = {}) {
  try {
    // Convert string 'true'/'false' to boolean, or default to including both
    const inStock =
      filterBy.inStock === "true"
        ? true
        : filterBy.inStock === "false"
        ? false
        : { $in: [true, false] }

    // Handle labels, ensuring it can accept both single string or an array of strings
    const labelsCriteria = filterBy.labels ? { $in: [].concat(filterBy.labels) } : { $exists: true }

    const criteria = {
      name: { $regex: filterBy.txt || "", $options: "i" },
      price: { $gte: parseInt(filterBy.minPrice) || 0 },
      inStock: inStock,
      labels: labelsCriteria,
    }

    // Add sort logic, defaulting to name ascending
    const sort = { [filterBy.sortBy || "name"]: filterBy.asc === "true" ? 1 : -1 }

    const collection = await dbService.getCollection("toy")
    var toys = await collection.find(criteria).sort(sort).toArray()
    return toys
  } catch (err) {
    logger.error("cannot find toys", err)
    throw err
  }
}

async function getById(toyId) {
  try {
    const collection = await dbService.getCollection("toy")
    var toy = collection.findOne({ _id: ObjectId(toyId) })
    return toy
  } catch (err) {
    logger.error(`while finding toy ${toyId}`, err)
    throw err
  }
}

async function remove(toyId) {
  try {
    const collection = await dbService.getCollection("toy")
    await collection.deleteOne({ _id: ObjectId(toyId) })
  } catch (err) {
    logger.error(`cannot remove toy ${toyId}`, err)
    throw err
  }
}

async function add(toy) {
  try {
    const collection = await dbService.getCollection("toy")
    await collection.insertOne(toy)
    return toy
  } catch (err) {
    logger.error("cannot insert toy", err)
    throw err
  }
}

async function update(toy) {
  try {
    const toyToSave = {
      name: toy.name,
      price: toy.price,
    }
    const collection = await dbService.getCollection("toy")
    await collection.updateOne({ _id: ObjectId(toy._id) }, { $set: toyToSave })
    return toy
  } catch (err) {
    logger.error(`cannot update toy ${toy._id}`, err)
    throw err
  }
}

async function addToyMsg(toyId, msg) {
  try {
    msg.id = utilService.makeId()
    const collection = await dbService.getCollection("toy")
    await collection.updateOne({ _id: ObjectId(toyId) }, { $push: { msgs: msg } })
    return msg
  } catch (err) {
    logger.error(`cannot add toy msg ${toyId}`, err)
    throw err
  }
}

async function removeToyMsg(toyId, msgId) {
  try {
    const collection = await dbService.getCollection("toy")
    await collection.updateOne({ _id: ObjectId(toyId) }, { $pull: { msgs: { id: msgId } } })
    return msgId
  } catch (err) {
    logger.error(`cannot add toy msg ${toyId}`, err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}
  if (filterBy.txt) {
    criteria.name = { $regex: filterBy.txt, $options: "i" }
  }
  if (filterBy.minPrice) {
    criteria.price = { $gte: +filterBy.minPrice }
  }

  return criteria
}
