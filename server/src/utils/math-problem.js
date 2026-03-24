/**
 * @param {string} operationType - ADD | SUB | MUL | DIV
 * @param {number} level - 1..10, впливає на діапазон чисел
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProblem(operationType, level = 1) {
  const lvl = Math.min(Math.max(Number(level) || 1, 1), 10);
  const spread = 5 + lvl * 4;

  switch (operationType) {
    case "ADD": {
      const n1 = randomInt(1, spread);
      const n2 = randomInt(1, spread);
      return { n1, n2, operationType: "ADD", answer: n1 + n2 };
    }
    case "SUB": {
      const n1 = randomInt(Math.max(5, spread - 5), spread + 10);
      const n2 = randomInt(1, n1);
      return { n1, n2, operationType: "SUB", answer: n1 - n2 };
    }
    case "MUL": {
      const maxFactor = Math.min(12, 4 + lvl);
      const n1 = randomInt(1, maxFactor);
      const n2 = randomInt(1, maxFactor);
      return { n1, n2, operationType: "MUL", answer: n1 * n2 };
    }
    case "DIV": {
      const divisor = randomInt(2, Math.min(12, 3 + lvl));
      const quotient = randomInt(2, Math.min(12, 3 + lvl));
      const n1 = divisor * quotient;
      const n2 = divisor;
      return { n1, n2, operationType: "DIV", answer: quotient };
    }
    default:
      throw new Error(`Unsupported operation: ${operationType}`);
  }
}

function formatProblemDisplay(p) {
  const sign =
    p.operationType === "ADD"
      ? "+"
      : p.operationType === "SUB"
        ? "−"
        : p.operationType === "MUL"
          ? "×"
          : "÷";
  return `${p.n1} ${sign} ${p.n2} = ?`;
}

function hintForPayload(decoded) {
  const { op, n1, n2 } = decoded;
  if (op === "ADD") {
    return `Підказка: спробуй додати спочатку ${n1} + 1 кілька разів у голові, або розбий ${n2} на частини. Результат більший за ${Math.max(n1, n2)}.`;
  }
  if (op === "SUB") {
    return `Підказка: відніми від ${n1} спочатку менше число; різниця менша за ${n1}.`;
  }
  if (op === "MUL") {
    return `Підказка: це множення в межах таблиці; результат кратний і ${n1}, і ${n2}.`;
  }
  if (op === "DIV") {
    return `Підказка: скільки разів ${n2} «вміщується» у ${n1}? (ціле число).`;
  }
  return "Підказка: уважно перечитай умову і перевір знак операції.";
}

module.exports = { generateProblem, formatProblemDisplay, hintForPayload };
