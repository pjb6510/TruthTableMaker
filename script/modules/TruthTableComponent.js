function generateId() {
  return "_" + Math.random().toString(36).slice(2, 11);
}

function makeElement(tagName, className) {
  const element = document.createElement(tagName);

  if (className) {
    element.classList.add(className);
  }

  return element;
}

function handleCloseButtonClick(event) {
  this.destroy();
}

function reverseColumnBools(table, columnIndex) {
  const tableRows = table.lastChild.childNodes;

  for (let i = 0; i < tableRows.length; i++) {
    const row = tableRows[i];
    const td = row.cells[columnIndex];

    if (td.textContent === "T") {
      td.textContent = "F";
    } else {
      td.textContent = "T";
    }
  }
}

function toggleNotOpTableHead(event) {
  if (event.target.tagName !== "TH") {
    return;
  }

  const tableHead = event.target;

  if (!tableHead.classList.contains("not-operator-added")) {
    tableHead.textContent = `~( ${tableHead.textContent} )`;
    tableHead.classList.toggle("not-operator-added");
  } else {
    tableHead.textContent = tableHead.textContent.slice(3).slice(0, -2);
    tableHead.classList.toggle("not-operator-added");
  }

  const table = this._$table;
  const cellIndex = tableHead.cellIndex;

  reverseColumnBools(table, cellIndex);
}

function updateTableHighlight() {
  const table = this._$table;
  const tableHeads = table.firstChild.firstChild.childNodes;

  const tableRows = table.lastChild.childNodes;
  const varCondition = this._varHighlightCondition;
  const varIndex = this._varIndex;
  const indexHavingNotOp = [];

  let isNoCondition = true;
  for (const variable in varCondition) {
    if (varCondition[variable] === "T" || varCondition[variable] === "F") {
      isNoCondition = false;
    }
  }

  if (isNoCondition) {
    for (let i = 0; i < tableRows.length; i++) {
      const row = tableRows[i];
      row.classList.remove("highlighted-row");
    }

    return;
  }

  for (let i = 0; i < tableHeads.length; i++) {
    const tableHead = tableHeads[i];
    const cellIndex = tableHead.cellIndex;

    if (tableHead.classList.contains("not-operator-added")) {
      indexHavingNotOp.push(cellIndex);
      tableHead.textContent = tableHead.textContent.slice(3).slice(0, -2);
      tableHead.classList.remove("not-operator-added");
      reverseColumnBools(table, cellIndex);
    }
  }

  for (let i = 0; i < tableRows.length; i++) {
    const row = tableRows[i];
    let isHighlighted = true;

    for (const variable in varIndex) {
      const condition = varCondition[variable];

      if (condition === "N") {
        continue;
      }

      const cellIndex = varIndex[variable];
      const td = row.cells[cellIndex];

      if (td.textContent !== condition) {
        isHighlighted = false;
        break;
      }
    }

    if (isHighlighted) {
      row.classList.add("highlighted-row");
    } else {
      row.classList.remove("highlighted-row");
    }
  }

  for (let i = 0; i < indexHavingNotOp.length; i++) {
    const index = indexHavingNotOp[i];
    const tableHead = tableHeads[index];

    tableHead.textContent = `~( ${tableHead.textContent} )`;
    tableHead.classList.add("not-operator-added");
    reverseColumnBools(table, index);
  }
}

function handleRadiosBoxChange(event) {
  const inputElement = event.target;
  const isTypeInput =
    inputElement.tagName === "INPUT" && inputElement.type === "radio";
  const isChecked = inputElement.checked;

  if (isTypeInput && isChecked) {
    const variable = inputElement.dataset.varName;
    const selectedRadio = inputElement.value.slice(0, 1).toUpperCase();

    this._varHighlightCondition[variable] = selectedRadio;

    updateTableHighlight.call(this);
  }
}

export default class TruthTable {
  constructor(materials) {
    this._analysisResult = materials.analysisResult;
    this._calculationResult = materials.calculationResult;
    this._$parentElement = materials.$parentElement;
    this._id = generateId();
    this._logicExpression = this._analysisResult.logicExpression;

    this._varIndex;
    this._varHighlightCondition;
    this.initVariableCondition(this._analysisResult.uniqueVariablesNames);
    this._$closeButton;
    this.makeCloseButton();
    this._$titleBox;
    this.makeTitleBox(this._analysisResult.logicExpression);
    this._$radiosBox;
    this.makeRadiosBox(this._analysisResult.uniqueVariablesNames, this._id);
    this._$table;
    this._$tableBox;
    this.makeTableBox(this._calculationResult.mergedList);

    this._$componentElement = {
      id: this._id,
      closeButton: this._$closeButton,
      titleBox: this._$titleBox,
      radiosBox: this._$radiosBox,
      tableBox: this._$tableBox,
    };

    this._$component;
    this.makeComponent(this._$componentElement, this._logicExpression);

    this.render();
    this._$component.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  initVariableCondition(uniqueVariablesNames) {
    this._varHighlightCondition = {};
    this._varIndex = {};

    for (let i = 0; i < uniqueVariablesNames.length; i++) {
      const varName = uniqueVariablesNames[i];
      this._varHighlightCondition[varName] = "N";
      this._varIndex[varName] = i;
    }
  }

  makeCloseButton() {
    const closeButton = makeElement("button", "close-button");

    const closeButtonIcon = makeElement("span", "close-x");
    closeButtonIcon.textContent = "×";

    closeButton.append(closeButtonIcon);

    closeButton.addEventListener("click", handleCloseButtonClick.bind(this));

    this._$closeButton = closeButton;
  }

  makeTitleBox(title) {
    const titleBox = makeElement("div", "result-title-box");
    titleBox.textContent = title;

    this._$titleBox = titleBox;
  }

  makeRadioSelect(varName, id) {
    const radioSelect = makeElement("div", "radio-select");
    radioSelect.dataset.var = varName;

    const notSelectedLabel = makeElement("label");
    const notSelectedRadio = document.createElement("input");
    notSelectedRadio.type = "radio";
    notSelectedRadio.name = `${id}${varName}`;
    notSelectedRadio.checked = true;
    notSelectedRadio.value = "notSelected";
    notSelectedRadio.dataset.varName = varName;
    notSelectedLabel.append(notSelectedRadio);
    notSelectedLabel.append("Not Selected");
    radioSelect.append(notSelectedLabel);

    const trueLabel = makeElement("label");
    const trueRadio = document.createElement("input");
    trueRadio.type = "radio";
    trueRadio.name = `${id}${varName}`;
    trueRadio.value = "true";
    trueRadio.dataset.varName = varName;
    trueLabel.append(trueRadio);
    trueLabel.append("True");
    radioSelect.append(trueLabel);

    const falseLabel = makeElement("label");
    const falseRadio = document.createElement("input");
    falseRadio.type = "radio";
    falseRadio.name = `${id}${varName}`;
    falseRadio.value = "false";
    falseRadio.dataset.varName = varName;
    falseLabel.append(falseRadio);
    falseLabel.append("False");
    radioSelect.append(falseLabel);

    return radioSelect;
  }

  makeRadiosBox(uniqueVariablesNames, id) {
    const radiosBox = makeElement("div", "radios-box");

    for (let i = 0; i < uniqueVariablesNames.length; i++) {
      const varName = uniqueVariablesNames[i];

      const radioBox = makeElement("div", "radio-box");

      const radioTitle = makeElement("div", "radio-title");
      radioTitle.textContent = varName;
      radioTitle.append(makeElement("hr"));
      radioBox.append(radioTitle);

      const radioSelect = this.makeRadioSelect(varName, id);
      radioBox.append(radioSelect);

      radiosBox.append(radioBox);
    }

    radiosBox.addEventListener("change", handleRadiosBoxChange.bind(this));

    this._$radiosBox = radiosBox;
  }

  makeTruthTable(truthTableDatas) {
    const resultTable = makeElement("table", "result-table");

    const tableHead = makeElement("thead");
    tableHead.addEventListener("click", toggleNotOpTableHead.bind(this));
    resultTable.append(tableHead);

    const tableBody = makeElement("tbody");
    resultTable.append(tableBody);

    const fieldRow = makeElement("tr");
    tableHead.append(fieldRow);

    for (const logicPart in truthTableDatas[0]) {
      const field = makeElement("th");

      field.textContent = logicPart;
      fieldRow.append(field);
    }

    const rows = [];

    for (let i = 0; i < truthTableDatas.length; i++) {
      const data = truthTableDatas[i];
      const row = makeElement("tr");

      for (const logicPart in data) {
        const truth = data[logicPart] ? "T" : "F";
        const cell = makeElement("td");
        cell.textContent = truth;

        row.append(cell);
      }

      rows.push(row);
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      tableBody.append(row);
    }

    this._$table = resultTable;

    return this._$table;
  }

  makeTableBox(truthTableDatas) {
    const tableBox = makeElement("div", "table-box");

    const tableViewPort = makeElement("div", "table-view-port");
    tableBox.append(tableViewPort);

    const resizeIconBox = makeElement("div", "resize-icon-box");
    tableBox.append(resizeIconBox);

    const resizeIcon = makeElement("img", "resize-icon");
    resizeIcon.src = "img/resizeIcon.png";
    resizeIcon.alt = "resize-icon";

    this._resizeIcon = resizeIcon;
    resizeIconBox.append(resizeIcon);

    const table = this.makeTruthTable(truthTableDatas);
    tableViewPort.append(table);

    this._$tableBox = tableBox;
  }

  makeComponent(componentElement, logicExpression) {
    const id = componentElement.id;
    const closeButton = componentElement.closeButton;
    const titleBox = componentElement.titleBox;
    const radiosBox = componentElement.radiosBox;
    const tableBox = componentElement.tableBox;

    const _$component = makeElement("div", "result-box");
    _$component.dataset.id = id;
    _$component.dataset.logic = logicExpression;

    _$component.append(closeButton);
    _$component.append(titleBox);
    _$component.append(radiosBox);
    _$component.append(tableBox);

    this._$component = _$component;
  }

  render() {
    this._$parentElement.append(this._$component);
  }

  destroy() {
    if (!this._$component) {
      throw Error("The element doesn't exist.");
    }

    this._$component.remove();
  }
}
