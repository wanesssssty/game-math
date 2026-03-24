const OPERATION_MAP = {
  add: "ADD",
  subtract: "SUB",
  multiply: "MUL",
  divide: "DIV",
};

function toOperationType(operation) {
  const mapped = OPERATION_MAP[operation];
  if (!mapped) {
    throw new Error(`Unknown operation: ${operation}`);
  }
  return mapped;
}

module.exports = { OPERATION_MAP, toOperationType };
