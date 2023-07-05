import { ActionFactory, ActionType } from "../domain/action";
import { ProdRule, ProdRuleFactory, RuleCondition } from "../domain/prodRules";
import PersistanceHandler from "../persistance/persistance";
import ProdRulesView from "./prodRulesView";

prepareProdRules();
const addButton = document.getElementById("addRuleButton");
const editButton = document.getElementById("editRuleButton");

function prepareProdRules() {
  console.log("preparing form!")
  prepareForm();
  prepareProdRuleTable();
  prepareAddRuleButton();
}

function prepareForm() {
  const multipleChoiceFields = getMultipleChoiceFields();
  let selectElement;
  let myDict;
  for (let elemID in multipleChoiceFields) {
    selectElement = document.getElementById(elemID);
    myDict = multipleChoiceFields[elemID];
    for (let key in multipleChoiceFields[elemID]) {
      let optionElement = document.createElement("option");
      optionElement.value = key;
      optionElement.textContent = myDict[key];
      selectElement.appendChild(optionElement);
    }
  }
}

function getMultipleChoiceFields(): {[key:string]: {[key:string] : string}} {
  return {
    rulecondition: {
      ALWAYS: "always",
      WORK: "during my work times",
      GOALS: "while my goals are not reached (WIP)",
    },

    actiontype: {
      REDIRECT: "redirect me to",
      POPUP: "show a popup with the following text",
      FRAME: "frame the unproductive page in the following color",
      LOG: "log my visit only (WIP)",
    },

    actiondelay: {
      0: "immediately",
      30000: "30 seconds",
      300000: "5 minutes",
      1200000: "20 minutes",
    },
  };
}

async function prepareProdRuleTable() {
  const ruleList = await PersistanceHandler.getAllRules();
  if (!ruleList || ruleList.length == 0 || Object.keys(ruleList).length == 0) {
    addDemoRule();
  } else {
    Object.keys(ruleList).forEach((unproductiveSite) => {
      let ruleIndex = 0;
      ruleList[unproductiveSite].forEach((rule: ProdRule) => {
        addToProdTable(rule, ruleIndex);
        ruleIndex++;
      });
    });
  }
}

function addDemoRule() {
  const demoURL = "demoUnproductiveSite.com";
  const demoAction = ActionFactory.createAction("POPUP", "Do you really want to spend time on this site?")
  const demoRule = ProdRuleFactory.createRule(demoURL, demoAction)

  ProdRulesView.addEntryToTable(demoRule, "demo");
}

function prepareAddRuleButton() {
  let addButton = document.getElementById("addRuleButton");
  addButton.addEventListener(
    "click",
    function (e) {
      addRuleFromForm();
    },
    false
  );
}

async function addRuleFromForm() {
  const formData = ProdRulesView.getFormData();

  let actionDelay = formData.delay;
  let actionCondition = formData.condition;
  let actionType = formData.actiontype;
  let ruleID = formData.ruleID;

  let newAction = ActionFactory.createAction(formData.actiontype, formData.targetVal)
  let newEntry = ProdRuleFactory.createRule(formData.actionsource, newAction, formData.condition, formData.delay)

  if (formData.actionsource && actionType && formData.targetVal) {
      const ruleIndex = await PersistanceHandler.addRule(newEntry);
      addToProdTable(newEntry, ruleIndex);
    }
  /*} else {
    const id_elems = _deconstructID(ruleID);
    PersistanceHandler.updateRule(
      id_elems["badSite"],
      id_elems["index"],
      newEntry
    );
  }
  */
  ProdRulesView.clearForm();
}

function addToProdTable(prodRule: ProdRule, ruleIndex: number) {
  const ruleID = _getRowID(prodRule.source, ruleIndex)
  const actionButtons = ProdRulesView.addEntryToTable(prodRule, ruleID);
  actionButtons["edit"].addEventListener("click", function (e) {
    prepareToEdit(prodRule, ruleIndex);
  });

  actionButtons["delete"].addEventListener(
    "click",
    function (e) {
      deleteEntry(prodRule.source, ruleIndex);
    },
    false
  );
}

function prepareToEdit(prodRule: ProdRule, ruleIndex: number) {
  const ruleID = _getRowID(prodRule.source, ruleIndex)
  ProdRulesView.setFormValues(prodRule, ruleID);
}

function deleteEntry(unproductiveSite: string, ruleIndex: number) {
  const ruleID = _getRowID(unproductiveSite, ruleIndex);
  PersistanceHandler.deleteRule(unproductiveSite, ruleIndex);
  ProdRulesView.removeFromTable(ruleID);
}

function _getRowID(unproductiveSite: string, ruleIndex: number) {
  const rowID = `${unproductiveSite}-${ruleIndex}`;
  return rowID;
}

function _deconstructID(ruleID: string) {
  const id_array = ruleID.split("-");
  return {
    badSite: id_array[0],
    index: id_array[1],
  };
}