function adjustCursorLocation(cursorLocation, adjustedLocation = 0) {
  this._$inputTextElement.selectionStart = cursorLocation + adjustedLocation;
  this._$inputTextElement.selectionEnd = cursorLocation + adjustedLocation;
}

function handleLogicInput(event) {
  const cursorLocation = event.target.selectionStart;
  const currentInputedChar = event.target.value.charAt(cursorLocation - 1);
  const isShortcutKey = this._acceptableKeys.hasOwnProperty(currentInputedChar);

  this.updateMessage("");

  if (isShortcutKey) {
    const symbol = this.convertCharToSymbol(currentInputedChar);
    event.target.value = event.target.value.replace(currentInputedChar, symbol);
    adjustCursorLocation.call(this, cursorLocation);

    return;
  }

  if (event.target.value === "") {
    this.updateMessage("Please input your logic.");
  }
}

function handleSymbolButtonClick(event) {
  const targetClass = event.target.className;
  const isClickedExactly =
    targetClass !== "button-box" && targetClass !== "variable-button-box";

  if (!isClickedExactly) {
    return;
  }

  const cursorLocation = this._cursorLocation;

  if (targetClass === "variable-button") {
    this._$inputTextElement.value =
      this._$inputTextElement.value.slice(0, cursorLocation) +
      event.target.textContent +
      this._$inputTextElement.value.slice(cursorLocation);
  } else {
    const isChildClicked =
      targetClass === "symbol-button-icon" ||
      targetClass === "symbol-button-title";
    const clickedButtonShortcut = isChildClicked
      ? event.target.parentElement.dataset.shortcut
      : event.target.dataset.shortcut;
    this.inputSymbol(clickedButtonShortcut, cursorLocation);
  }

  this.setCursorLocation(cursorLocation + 1);

  this.updateMessage("");
}

function handleClearButtonClick(event) {
  const isClickedExactly = event.target.className !== "clear-button-box";

  if (!isClickedExactly) {
    return;
  }

  const isClearAll = event.target.className === "clear-all-button";
  const cursorLocation = this._cursorLocation;

  if (isClearAll) {
    this._$inputTextElement.value = "";

    this.setCursorLocation(0);
  } else if (cursorLocation !== 0) {
    this._$inputTextElement.value =
      this._$inputTextElement.value.slice(0, cursorLocation - 1) +
      this._$inputTextElement.value.slice(cursorLocation);
    this.setCursorLocation(cursorLocation - 1);
  }

  if (this._$inputTextElement.value === "") {
    this.updateMessage("Please input your logic.");
  }
}

function handleSubmitButtonClick(event) {
  this._submitLogic(this._$inputTextElement.value);
}

function handleMainInputFormSubmit(event) {
  event.preventDefault();
  this._submitLogic(this._$inputTextElement.value);
}

function handleInputTextBlur(event) {
  this.setCursorLocation(event.target.selectionStart);
}

function handleKeydown(event) {
  const isModifierKey = event.altKey || event.ctrlKey;
  const isInputing = document.activeElement === this._$inputTextElement;

  if (event.key.length === 1 && !isModifierKey && !isInputing) {
    this._$inputTextElement.focus();
    this._$inputTextElement.selectionStart = this._cursorLocation;
    this._$inputTextElement.selectionEnd = this._cursorLocation;
  }
}

function handleViewportResize(event) {
  this.updateViewSizeAndIsMobile();
}

export default class UI {
  constructor($inputerElements, submitFunc) {
    this._$inputTextElement = $inputerElements.$inputTextElement;
    this._$InputForm = $inputerElements.$InputForm;
    this._$messageElement = $inputerElements.$messageElement;
    this._$buttonBox = $inputerElements.$buttonBox;
    this._$clearButtonBox = $inputerElements.$clearButtonBox;
    this._$submitButton = $inputerElements.$submitButton;
    this._submitLogic = submitFunc;
    this._acceptableKeys = {
      1: "true",
      2: "false",
      "!": "not",
      3: "not",
      "&": "and",
      4: "and",
      "|": "or",
      5: "or",
      "^": "xor",
      6: "xor",
      ">": "ifThen",
      7: "ifThen",
      "=": "isDefinedAs",
      8: "isDefinedAs",
      9: "leftParentheses",
      0: "rightParentheses",
    };

    this._logicSymbols = {
      variable: ["p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
      true: "⊤",
      false: "⊥",
      not: "~",
      and: "∧",
      or: "∨",
      xor: "⊻",
      ifThen: "→",
      isDefinedAs: "≡",
      leftParentheses: "(",
      rightParentheses: ")",
      space: " ",
    };

    this._cursorLocation = 0;

    this._helpButtonState = {
      isMouseDown: false,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
      distanceX: 0,
      distanceY: 0,
    };

    this._viewWidth = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
    this._isMobile = this._viewWidth < 800 ? true : false;
  }

  updateViewSizeAndIsMobile() {
    this._viewWidth = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
    this._isMobile = this._viewWidth < 800 ? true : false;
  }

  setCursorLocation(index) {
    this._cursorLocation = index;
  }

  activateElementsEvent() {
    document.addEventListener("keydown", handleKeydown.bind(this));
    this._$clearButtonBox.addEventListener(
      "click",
      handleClearButtonClick.bind(this)
    );
    this._$buttonBox.addEventListener(
      "click",
      handleSymbolButtonClick.bind(this)
    );
    this._$inputTextElement.addEventListener(
      "input",
      handleLogicInput.bind(this)
    );
    this._$inputTextElement.addEventListener(
      "blur",
      handleInputTextBlur.bind(this)
    );
    this._$InputForm.addEventListener(
      "submit",
      handleMainInputFormSubmit.bind(this)
    );
    this._$submitButton.addEventListener(
      "click",
      handleSubmitButtonClick.bind(this)
    );

    window.addEventListener("resize", handleViewportResize.bind(this));
  }

  updateMessage(message) {
    this._$messageElement.textContent = message;
  }

  convertCharToSymbol(Char) {
    const symbol = this._logicSymbols[this._acceptableKeys[Char]];
    return symbol;
  }

  inputSymbol(shortcut, index) {
    const symbol = this.convertCharToSymbol(shortcut);
    this._$inputTextElement.value =
      this._$inputTextElement.value.slice(0, index) +
      symbol +
      this._$inputTextElement.value.slice(index);
  }

  highlightError(result) {
    if (
      result.errorStartIndex !== undefined &&
      result.errorEndIndex !== undefined
    ) {
      this._$inputTextElement.focus();
      this._$inputTextElement.selectionStart = result.errorStartIndex;
      this._$inputTextElement.selectionEnd = result.errorEndIndex;
    }
  }
}
