const express = require("express");
const router = express.Router()
const dataService = require("../../controllers/bl.js");
const { writeLog } = require("../../../dataBase/LOG/log.js");

router.put("/:table/:itemId", async (req, res) => {
  try {
    const body = addUserIdCondition(req);
    const result = await dataService.updateItem(req.params.table, body, [
      { field: "id", value: req.params.itemId },
    ]);
    writeLog(
      `Updated itemId=${req.params.itemId} in table=${
        req.params.table
      } with data=${JSON.stringify(body)}`,
      "info"
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    writeLog(
      `ERROR updating itemId=${req.params.itemId} in table=${req.params.table} - ${err.message}`,
      "error"
    );
    res.status(500).json({ error: `ERROR updating ${req.params.table} item` });
  }
});

router.put("/:parentTable/:parentId/:childTable/:childId", async (req, res) => {
  const parentField = `${req.params.parentTable.slice(0, -1)}_id`;
  try {
    const baseData = addUserIdCondition(req);
    const body = {
      ...baseData,
      [parentField]: req.params.parentId,
    };

    const result = await dataService.updateItem(req.params.childTable, body, [
      { field: parentField, value: req.params.parentId },
      { field: "id", value: req.params.childId },
    ]);
    writeLog(
      `Updated childId=${req.params.childId} in table=${
        req.params.childTable
      } with parentId=${req.params.parentId} and data=${JSON.stringify(body)}`,
      "info"
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    writeLog(
      `ERROR updating childId=${req.params.childId} in table=${req.params.childTable} - ${err.message}`,
      "error"
    );
    res
      .status(500)
      .json({ error: `ERROR updating ${req.params.childTable} item` });
  }
});

const addUserIdCondition = (req) => {
  const body = { ...req.body };
  if (body.user_id === "null") {
    body.user_id = req.user?.id;
  }
  return body;
};

module.exports = router;
