function handleButtonMousedown(event) {
  event.preventDefault();

  this._buttonState.isMouseDown = true;

  this._buttonState.startX = event.clientX;
  this._buttonState.startY = event.clientY;

  const elementPosX = event.target.offsetLeft;
  const elementPosY = event.target.offsetTop;
  const mousePosX = event.clientX;
  const mousePosY = event.clientY;

  this._buttonState.offsetX = elementPosX - mousePosX;
  this._buttonState.offsetY = elementPosY - mousePosY;
}

function followCursor(target, clientX, clientY) {
  const helpButton = target;
  const helpContent = this._$contentBox;
  const mousePosX = clientX;
  const mousePosY = clientY;

  helpButton.style.left = mousePosX + this._buttonState.offsetX + "px";
  helpButton.style.top = mousePosY + this._buttonState.offsetY + "px";
  helpContent.style.left = mousePosX + this._buttonState.offsetX - 10 + "px";
  helpContent.style.top = mousePosY + this._buttonState.offsetY - 10 + "px";
}

function handleButtonMousemove(event) {
  event.preventDefault();
  if (!this._buttonState.isMouseDown || this._isMobile) {
    return;
  }

  followCursor.call(this, event.target, event.clientX, event.clientY);
}

function handleButtonMouseleave(event) {
  if (this._buttonState.isMouseDown && !this._isMobile) {
    followCursor.call(this, event.target, event.clientX, event.clientY);
  }
}

function handleMouseup(event) {
  const isMoved
    = Math.abs(this._buttonState.startX - event.clientX) > 5
    || Math.abs(this._buttonState.startY - event.clientY) > 5;

  if (!isMoved) {
    this._$contentBox.classList.toggle("hidden");

    if (this._isMobile) {
      this._$filter.classList.toggle("hidden");
    }
  }

  if (this._buttonState.isMouseDown && !this._isMobile) {
    followCursor.call(this, this._$button, event.clientX, event.clientY);
  }

  this._buttonState.isMouseDown = false;
}

function handleFilterClick(event) {
  if (!this._isMobile) {
    return;
  }

  this._$contentBox.classList.toggle("hidden");
  this._$filter.classList.toggle("hidden");
}

function handleViewportResize(event) {
  this.updateViewSizeAndIsMobile();
}

function handleLanguageSelectClick(event) {
  const clickedButton = event.target
  const isClickedExactly = clickedButton.tagName === "SPAN";
  if (!isClickedExactly) {
    return;
  }

  const language = clickedButton.textContent;

  this.convertLanguage(language);
  clickedButton.classList.add("selected");
  const languageButtons = clickedButton.parentNode.children;

  for (let i = 0; i < languageButtons.length; i++) {
    const languageButton = languageButtons[i];

    if (languageButton !== clickedButton) {
      languageButton.classList.remove("selected");
    }
  }
}

export default class Manual {
  constructor($manualElements) {
    this._$button = $manualElements.$button;
    this._$contentBox = $manualElements.$contentBox;
    this._$filter = $manualElements.$filter;
    this._$languageSelectBox = this._$contentBox.querySelector(".manual-language-select-box");
    this._$contentEnglish = this._$contentBox.querySelector(".manual-content-eng");
    this._$contentKorean = this._$contentBox.querySelector(".manual-content-kor");

    this._buttonState = {
      isMouseDown: false,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
      distanceX: 0,
      distanceY: 0,
    };

    this._viewWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    this._isMobile = this._viewWidth < 800 ? true : false;
    this._isKorean = false;

    this.activateElementsEvent();
  }

  convertLanguage(language) {
    if (this._isKorean && language === "ENG") {
      this._$contentEnglish.classList.remove("hidden");
      this._$contentKorean.classList.add("hidden");
      this._isKorean = false;
    } else if (!this._isKorean && language === "KOR") {
      this._$contentKorean.classList.remove("hidden");
      this._$contentEnglish.classList.add("hidden");
      this._isKorean = true;
    }
  }

  activateElementsEvent() {
    this._$button.addEventListener("mousedown", handleButtonMousedown.bind(this));
    this._$button.addEventListener("mousemove", handleButtonMousemove.bind(this));
    this._$button.addEventListener("mouseleave", handleButtonMouseleave.bind(this));
    document.addEventListener("mouseup", handleMouseup.bind(this));
    this._$filter.addEventListener("click", handleFilterClick.bind(this));
    window.addEventListener("resize", handleViewportResize.bind(this));
    this._$languageSelectBox.addEventListener("click", handleLanguageSelectClick.bind(this));
  }

  updateViewSizeAndIsMobile() {
    this._viewWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    this._isMobile = this._viewWidth < 800 ? true : false;
  }
}
