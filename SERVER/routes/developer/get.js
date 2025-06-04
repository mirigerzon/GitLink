const express = require("express");
const router = express.Router();
const dataService = require("../../controllers/bl.js");
const { writeLog } = require("../../../dataBase/LOG/log.js");

const createConditions = (req) => {
  const query = { ...req.query };
  if (query.user_id === "null") {
    query.user_id = req.user?.id;
  }
  return Object.entries(query).map(([key, value]) => ({
    field: key,
    value: isNaN(value) ? value : Number(value),
  }));
};

const buildConditions = (req) => [
  ...createConditions(req),
  ...(req.params.itemId ? [{ field: "id", value: req.params.itemId }] : []),
  ...(req.params.parentId && req.params.parentTable
    ? [
        {
          field: `${req.params.parentTable.slice(0, -1)}_id`,
          value: req.params.parentId,
        },
      ]
    : []),
];

const handleGetRequest = async (req, res) => {
  const table = req.params.childTable || req.params.table;
  const conditions = buildConditions(req);

  try {
    const data = await dataService.getItemByConditions(table, conditions);
    writeLog(
      `Fetched from ${table} with conditions=${JSON.stringify(conditions)}`,
      "info"
    );
    res.json(data);
  } catch (err) {
    console.error(err);
    writeLog(`ERROR fetching from ${table} - ${err.message}`, "error");
    res.status(500).json({ error: `ERROR requesting ${table}` });
  }
};

router.get("/:table", handleGetRequest);
router.get("/:table/:itemId", handleGetRequest);
router.get("/:parentTable/:parentId/:childTable", handleGetRequest);
router.get("/:parentTable/:parentId/:childTable/:itemId", handleGetRequest);

module.exports = router;
