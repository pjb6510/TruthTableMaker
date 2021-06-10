function removeSpace(logicExpression) {
  const result = logicExpression.replaceAll(" ", "");

  return result;
}

function verifyBasicRule(logicExpression) {
  if (!logicExpression) {
    return {
      result: false,
      message: "Error. Nothing has been inputted.",
    };
  }

  const parenthesesCount = {};
  for (let i = 0; i < logicExpression.length; i++) {
    const char = logicExpression[i];

    if (char === "(") {
      parenthesesCount["("] = parenthesesCount["("] + 1 || 1;
    } else if (char === ")") {
      parenthesesCount[")"] = parenthesesCount[")"] + 1 || 1;
    }
  }

  if (parenthesesCount["("] !== parenthesesCount[")"]) {
    return {
      result: false,
      message: `Parentheses Error. left:${parenthesesCount["("]} right: ${parenthesesCount[")"]}`,
    };
  }

  const hasOpNotOp = RegExp.prototype.exec.call(/~+[∧∨⊻→≡]/, logicExpression);
  if (hasOpNotOp) {
    return {
      result: false,
      message: `Error. Operator can't have NotOperators('~').`,
      errorStartIndex: hasOpNotOp.index,
      errorEndIndex: hasOpNotOp.index + hasOpNotOp[0].length,
    };
  }

  const hasNotopInRight = RegExp.prototype.exec.call(/.+~+$/, logicExpression);
  if (hasNotopInRight) {
    return {
      result: false,
      message: `Error. Can't end with not operator(~)`,
    };
  }

  return {
    result: true,
  };
}

function getVariables(logicList) {
  let result = [];

  for (let i = 0; i < logicList.length; i++) {
    const logicElement = logicList[i];

    if (logicElement.type === "variable" || logicElement.type === "constant") {
      result.push(logicElement);
    } else if (logicElement.type === "array") {
      const recursiveCallResult = getVariables(logicElement.contentArray);
      result = result.concat(recursiveCallResult);
    }
  }

  return result;
}

function indexOfBracket(string, leftBracketIndex) {
  if (string[leftBracketIndex] !== "(") {
    throw Error("string[leftBracketIndex] !== '('");
  }

  let openingBracketCount = 0;

  for (let i = leftBracketIndex + 1; i < string.length; i++) {
    const char = string[i];

    if (char === "(") {
      openingBracketCount++;
      continue;
    }

    if (char === ")") {
      if (openingBracketCount === 0) {
        return i;
      } else {
        openingBracketCount--;
      }
    }
  }
}

function objectifyVariable(variableString, notOpCount, startIndex) {
  const notOpString = new Array(notOpCount).fill("~").join("");
  const varObj = {
    content: `${notOpString}${variableString}`,
    contentExceptedNotOp: variableString,
    notOpNumber: notOpCount,
    type: "variable",
    property: "value",
    startIndex: startIndex - notOpCount,
    endIndex: startIndex + variableString.length,
  };

  if (variableString === "⊤" || variableString === "⊥") {
    varObj.type = "constant";
    varObj.value = variableString === "⊤" ? true : false;
  }

  return varObj;
}

function objectifyArray(array, notOpCount, startIndex) {
  const notOpString = new Array(notOpCount).fill("~").join("");
  let arrayString = "";

  for (let i = 0; i < array.length; i++) {
    const logicElement = array[i];
    arrayString += logicElement.content;
  }

  return {
    content: `${notOpString}(${arrayString})`,
    contentExceptedNotOp: `${arrayString}`,
    contentArray: array,
    notOpNumber: notOpCount,
    type: "array",
    property: "value",
    startIndex: startIndex - notOpCount,
    endIndex: startIndex + arrayString.length,
  };
}

function andMethod(left, right) {
  return left && right;
}

function orMethod(left, right) {
  return left || right;
}

function xorMethod(left, right) {
  return left !== right;
}

function ifThenMethod(left, right) {
  if (left && !right) {
    return false;
  } else {
    return true;
  }
}

function isDefinedAsMethod(left, right) {
  return left === right;
}

function objectifyOperator(operatorChar, leftValue, startIndex) {
  let method;

  switch (operatorChar) {
    case "∧":
      method = andMethod;
      break;
    case "∨":
      method = orMethod;
      break;
    case "⊻":
      method = xorMethod;
      break;
    case "→":
      method = ifThenMethod;
      break;
    case "≡":
      method = isDefinedAsMethod;
      break;

    default:
      throw Error("invalid operatorChar is inputted.");
  }

  return {
    content: operatorChar,
    leftValue,
    rightValue: null,
    leftResult: null,
    rightResult: null,
    operationResult: null,
    resultExpression: null,
    method,
    type: "operator",
    property: "operator",
    startIndex,
    endIndex: startIndex + operatorChar.length,
  };
}

function saveAndInitVariable(buffer, isLastIndex = false) {
  const varNameStartIndex = isLastIndex
    ? buffer.index - buffer.variable.length + buffer.indexStartNum + 1
    : buffer.index - buffer.variable.length + buffer.indexStartNum;
  const variableObj = objectifyVariable(
    buffer.variable,
    buffer.notOpCount,
    varNameStartIndex
  );
  buffer.result.push(variableObj);
  buffer.prevVariable = variableObj;

  if (buffer.operatorFindingNextVar) {
    buffer.operatorFindingNextVar.rightValue = variableObj;
  }

  buffer.variable = "";
  buffer.notOpCount = 0;
}

function divideLogic(logicExpression, indexStartNum) {
  if (!logicExpression) {
    return null;
  }

  let isFirstOperator = true;

  const result = [];
  const isOperatorRegex = /[∧∨⊻→≡]/;
  const buffer = {
    variable: "",
    index: 0,
    notOpCount: 0,
    indexStartNum: indexStartNum,
    result: result,
    prevVariable: null,
    prevOperator: null,
    operatorFindingNextVar: null,
  };

  for (let i = 0; i < logicExpression.length; i++) {
    buffer.index = i;

    const char = logicExpression[i];
    const isOperator = isOperatorRegex.test(char);
    const isLastIndex = i === logicExpression.length - 1;
    const isLeftBracket = char === "(";
    const isRightBracket = char === ")";
    const isNotOperator = char === "~";

    if (isRightBracket) {
      continue;
    }

    if (isNotOperator) {
      if (buffer.variable) {
        saveAndInitVariable(buffer);
      }

      buffer.notOpCount++;
      continue;
    }

    if (isLeftBracket) {
      if (buffer.variable) {
        saveAndInitVariable(buffer);
      }

      const rightBracketIndex = indexOfBracket(logicExpression, i);
      const expressionInBracket = logicExpression.slice(
        i + 1,
        rightBracketIndex
      );
      const recursiveCallResult = divideLogic(expressionInBracket, i + 1);

      if (recursiveCallResult) {
        const arrStartIndex = i + indexStartNum;
        const arrayObj = objectifyArray(
          recursiveCallResult,
          buffer.notOpCount,
          arrStartIndex
        );
        result.push(arrayObj);
        buffer.prevVariable = arrayObj;

        if (buffer.operatorFindingNextVar) {
          buffer.operatorFindingNextVar.rightValue = arrayObj;
        }

        buffer.notOpCount = 0;
      }

      i = rightBracketIndex;
      continue;
    }

    if (isOperator) {
      if (buffer.variable) {
        saveAndInitVariable(buffer);
      }

      buffer.notOpCount = 0;

      const opStartIndex = i + indexStartNum;

      const opLeftValue = isFirstOperator
        ? buffer.prevVariable
        : buffer.prevOperator;
      isFirstOperator = false;

      const operatorObj = objectifyOperator(char, opLeftValue, opStartIndex);

      result.push(operatorObj);
      buffer.operatorFindingNextVar = operatorObj;
      buffer.prevOperator = operatorObj;
    } else if (char !== "~") {
      buffer.variable += char;
    }

    if (isLastIndex && buffer.variable) {
      saveAndInitVariable(buffer, true);
    }
  }

  return result;
}

function verifyLogicSequence(logicList) {
  const firstElement = logicList[0];
  const lastElement = logicList[logicList.length - 1];

  if (firstElement.property === "operator") {
    return {
      result: false,
      message: `Sequence Error. First element must be a value. '${firstElement.content}'`,
      errorStartIndex: firstElement.startIndex,
      errorEndIndex: firstElement.endIndex,
      logicList,
    };
  }

  if (lastElement.property === "operator") {
    return {
      result: false,
      message: `Sequence Error. Last element must be a value. '${lastElement.content}'`,
      errorStartIndex: lastElement.startIndex,
      errorEndIndex: lastElement.endIndex,
      logicList,
    };
  }

  let prevElement = null;

  for (let i = 0; i < logicList.length; i++) {
    const currentElement = logicList[i];

    if (prevElement && currentElement.property === prevElement.property) {
      return {
        result: false,
        message: `Sequence Error. '${prevElement.content} ${currentElement.content}'`,
        errorStartIndex: prevElement.startIndex,
        errorEndIndex: currentElement.endIndex,
        logicList,
      };
    }

    if (currentElement.type === "array") {
      const recursiveCallResult = verifyLogicSequence(
        currentElement.contentArray
      );

      if (!recursiveCallResult.result) {
        return recursiveCallResult;
      }
    }

    prevElement = currentElement;
  }

  return {
    result: true,
  };
}

function verifyVariables(variables) {
  for (let i = 0; i < variables.length; i++) {
    const variable = variables[i];
    const variableString = variable.contentExceptedNotOp;

    if (variableString.includes("⊤") && variableString !== "⊤") {
      return {
        result: false,
        message: `Error. Can't use '⊤' as a variable name. '${variableString}'`,
        errorStartIndex: variable.startIndex,
        errorEndIndex: variable.endIndex,
      };
    }

    if (variableString.includes("⊥") && variableString !== "⊥") {
      return {
        result: false,
        message: `Error. Can't use '⊥' as a variable name. '${variableString}'`,
        errorStartIndex: variable.startIndex,
        errorEndIndex: variable.endIndex,
      };
    }
  }

  return {
    result: true,
  };
}

function getUniqueVariablesNames(variables) {
  let result = [];

  for (let i = 0; i < variables.length; i++) {
    const variable = variables[i];

    if (variable.type === "array") {
      const recursiveCallResult = getUniqueVariablesNames(
        variable.contentArray
      );
      result = result.concat(recursiveCallResult);
    } else {
      if (
        variable.contentExceptedNotOp !== "⊥" &&
        variable.contentExceptedNotOp !== "⊤"
      ) {
        result.push(variable.contentExceptedNotOp);
      }
    }
  }

  result = Array.from(new Set(result));

  return result;
}

export default function analysisLogic(logicExpression) {
  const newLogicExpression = removeSpace(logicExpression);

  let resultVerify = verifyBasicRule(newLogicExpression);

  if (!resultVerify.result) {
    return resultVerify;
  }

  const logicList = divideLogic(newLogicExpression, 0);
  const variables = getVariables(logicList);
  const uniqueVariablesNames = getUniqueVariablesNames(variables);

  resultVerify = verifyLogicSequence(logicList);
  if (!resultVerify.result) {
    return resultVerify;
  }

  resultVerify = verifyVariables(variables);
  if (!resultVerify.result) {
    return resultVerify;
  }

  return {
    logicExpression,
    result: true,
    variables,
    logicList,
    uniqueVariablesNames,
  };
}
