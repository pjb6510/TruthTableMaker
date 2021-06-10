"use strict";

import UserInterface from "./modules/UserInterface.js";
import Manual from "./modules/Manual.js";
import analysisLogic from "./modules/analysisLogic.js";
import calculateLogic from "./modules/calculateLogic.js";
import TruthTable from "./modules/TruthTableComponent.js";

const $inputerElements = {
  $inputTextElement: document.querySelector(".main-input"),
  $InputForm: document.querySelector(".main-input-form"),
  $messageElement: document.querySelector(".message-box"),
  $buttonBox: document.querySelector(".button-box"),
  $clearButtonBox: document.querySelector(".clear-button-box"),
  $submitButton: document.querySelector(".submit-button"),
};

const $manualElements = {
  $button: document.querySelector(".manual-button"),
  $contentBox: document.querySelector(".manual-content-box"),
  $filter: document.querySelector(".filter"),
};

const $resultTableSection = document.querySelector(".result-table-section");

function getLogicExpression(logicExpression) {
  makeTruthTable(logicExpression);
}

const mainManual = new Manual($manualElements);
const mainUI = new UserInterface($inputerElements, getLogicExpression);
mainUI.activateElementsEvent();

function makeTruthTable(logicExpression) {
  const analysisResult = analysisLogic(logicExpression);

  if (!analysisResult.result) {
    mainUI.updateMessage(analysisResult.message);
    mainUI.highlightError(analysisResult);

    return;
  }

  const calculationResult = calculateLogic(analysisResult);

  const materials = {
    $parentElement: $resultTableSection,
    analysisResult,
    calculationResult,
  };

  new TruthTable(materials);
  mainUI.updateMessage("Complete!");
}
