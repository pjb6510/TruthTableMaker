function makeCases(values) {
  let varsExceptedConst = [];

  let isIncludesTrue = false;
  let isIncludesFalse = false;

  for (let i = 0; i < values.length; i++) {
    const value = values[i];

    if (value.type === "constant") {
      if (value.contentExceptedNotOp === "⊤") {
        isIncludesTrue = true;
      } else {
        isIncludesFalse = true;
      }
    } else {
      varsExceptedConst.push(value.contentExceptedNotOp);
    }
  }

  varsExceptedConst = Array.from(new Set(varsExceptedConst));

  const result = [];
  const switchNumber = {};
  const switchCount = {};
  const inputedBools = {};
  const NUMBER_OF_CASES = Math.pow(2, varsExceptedConst.length);

  for (let i = 0; i < varsExceptedConst.length; i++) {
    const value = varsExceptedConst[i];
    switchNumber[value] = NUMBER_OF_CASES / Math.pow(2, i + 1);
    switchCount[value] = 0;
    inputedBools[value] = true;
  }

  for (let i = 0; i < NUMBER_OF_CASES; i++) {
    const row = {};

    for (let j = 0; j < varsExceptedConst.length; j++) {
      const value = varsExceptedConst[j];

      row[value] = inputedBools[value];
      switchCount[value]++;

      if (switchCount[value] === switchNumber[value]) {
        switchCount[value] = 0;
        inputedBools[value] = !inputedBools[value];
      }
    }

    if (isIncludesTrue) {
      row["⊤"] = true;
    }

    if (isIncludesFalse) {
      row["⊥"] = false;
    }

    result.push(row);
  }

  return result;
}

function copyObjsArr(copiedObjsArr) {
  const result = [];

  for (let i = 0; i < copiedObjsArr.length; i++) {
    const obj = copiedObjsArr[i];
    const newObj = {};

    Object.assign(newObj, obj);
    result.push(newObj);
  }

  return result;
}

function mergeObjsArr(a, b) {
  if (a.length !== b.length) {
    throw Error("b's length must equal a's length");
  }

  const result = copyObjsArr(a);

  for (let i = 0; i < b.length; i++) {
    const obj = b[i];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[i][key] = obj[key];
      }
    }
  }

  return result;
}

function extendObj(target, source) {
  for (const key in source) {
    target[key] = source[key];
  }
}

function calcLeftValue(operator, _case) {
  let leftString;
  const result = {};

  if (operator.leftValue.type === "array") {
    leftString = operator.leftValue.content;
    const recursiveCallResult = calculateCase(operator.leftValue.contentArray, _case);
    operator.leftResult = recursiveCallResult[operator.leftValue.contentExceptedNotOp];

    if (operator.leftValue.notOpNumber % 2 === 1) {
      operator.leftResult = !operator.leftResult;
    }

    result[operator.leftValue.content] = operator.leftResult;
  } else if (operator.leftValue.property === "value") {
    leftString = operator.leftValue.content;
    operator.leftResult = _case[operator.leftValue.contentExceptedNotOp];

    if (operator.leftValue.notOpNumber % 2 === 1) {
      operator.leftResult = !operator.leftResult;
    }
  } else {
    leftString = operator.leftValue.resultExpression;
    operator.leftResult = operator.leftValue.operationResult;
  }

  return {
    leftString,
    result,
  };
}

function calcRightValue(operator, _case) {
  let rightString;
  const result = {};

  if (operator.rightValue.type === "array") {
    rightString = operator.rightValue.content;
    const recursiveCallResult = calculateCase(operator.rightValue.contentArray, _case);
    operator.rightResult = recursiveCallResult[operator.rightValue.contentExceptedNotOp];

    if (operator.rightValue.notOpNumber % 2 === 1) {
      operator.rightResult = !operator.rightResult;
    }

    result[operator.rightValue.content] = operator.rightResult;
  } else {
    rightString = operator.rightValue.content;
    operator.rightResult = _case[operator.rightValue.contentExceptedNotOp];

    if (operator.rightValue.notOpNumber % 2 === 1) {
      operator.rightResult = !operator.rightResult;
    }
  }

  return {
    rightString,
    result,
  };
}

function calculateCase(logicList, _case) {
  const result = {};

  if (logicList.length === 1) {
    const singleValue = logicList[0];

    if (singleValue.type === "array") {
      const recursiveCallResult = calculateCase(singleValue.contentArray, _case);

      result[singleValue.content]
        = singleValue.notOpNumber % 2 === 1
        ? !recursiveCallResult[singleValue.contentExceptedNotOp]
        : recursiveCallResult[singleValue.contentExceptedNotOp];

      return result;
    } else {
      const tempResult = _case[singleValue.contentExceptedNotOp];
      result[singleValue.content] = singleValue.notOpNumber % 2 === 1 ? !tempResult : tempResult;

      return result;
    }
  }

  for (let i = 0; i < logicList.length; i++) {
    if (logicList[i].type !== "operator") {
      continue;
    }

    const operator = logicList[i];

    const leftCalcResult = calcLeftValue(operator, _case);
    const leftString = leftCalcResult.leftString;

    if (leftCalcResult.result) {
      extendObj(result, leftCalcResult.result);
    }

    const rightCalcResult = calcRightValue(operator, _case);
    const rightString = rightCalcResult.rightString;

    if (rightCalcResult.result) {
      extendObj(result, rightCalcResult.result);
    }

    operator.operationResult = operator.method(operator.leftResult, operator.rightResult);
    operator.resultExpression = `${leftString}${operator.content}${rightString}`;
    result[operator.resultExpression] = operator.operationResult;

    operator.leftResult = null;
    operator.rightResult = null;
  }

  return result;
}

function calulateAllCases(logicList, allCases) {
  const result = [];

  for (let i = 0; i < allCases.length; i++) {
    const _case = allCases[i];

    result.push(calculateCase(logicList, _case));
  }

  return result;
}

export default function calculateLogic(analysisResult) {
  const variables = analysisResult.variables;
  const logicList = analysisResult.logicList;

  const allCases = makeCases(variables);
  const calculationResult = calulateAllCases(logicList, allCases);
  const mergedList = mergeObjsArr(allCases, calculationResult);

  return {
    allCases,
    calculationResult,
    mergedList,
  };
}
