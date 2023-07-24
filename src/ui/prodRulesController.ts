import { ActionFactory, ActionType } from "../domain/action";
import { ProdRule, ProdRuleFactory, RuleCondition } from "../domain/prodRules";
import { IDHandler, getStringsForEnums } from "../helpers/helpers";
import PersistanceHandler from "../domain/prodRuleRepo";
import ProdRulesView from "./prodRulesView";

prepareProdRules();

function prepareProdRules() {
  prepareForm();
  prepareProdRuleTable();
  prepareAddRuleButton();
  prepareCancelButton();
}

function prepareForm() {
  const multipleChoiceFields = getStringsForEnums();
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

function prepareCancelButton() {
  const cancelButton = document.getElementById("cancelRuleButton") as HTMLButtonElement;

  cancelButton.addEventListener(
    "click",
    function (e) {
      e.preventDefault()
      ProdRulesView.clearForm();
    },
    false
  );
}

async function prepareProdRuleTable() {
  const ruleList = await PersistanceHandler.getAllRules();
  if (!ruleList || Object.keys(ruleList).length == 0 || Object.keys(ruleList).length == 0) {
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

  ProdRulesView.addEntry(demoRule, "demo");
}

function prepareAddRuleButton() {
  const saveButton = document.getElementById("saveRuleButton") as HTMLButtonElement;
  saveButton.addEventListener(
    "click",
    function (e) {
      e.preventDefault()
      addRuleFromForm();
      ProdRulesView.isFormEditMode(false)
    },
    false
  );
}

async function addRuleFromForm() {
  const formData = ProdRulesView.getFormData();

  const actionsource = formData.actionsource
  const targetVal = formData.targetVal
  const actionDelay = formData.delay;
  const actionCondition = formData.condition;
  const actionType = formData.actiontype;
  const ruleID: string = formData.ruleID as string;

  let newAction = ActionFactory.createAction(actionType, targetVal)
  let newEntry = ProdRuleFactory.createRule(actionsource, newAction, actionCondition, actionDelay)

  addOrUpdateEntry(newEntry, ruleID)
  resetSite()
}

async function addOrUpdateEntry(ruleData: ProdRule, ruleID: string) {
  if (ruleData.source && ruleData.action.type && ruleData.action.targetValue) {
    if (ruleID == IDHandler.STANDARD_ID || ruleID == "") {
      const ruleIndex = await PersistanceHandler.addRule(ruleData);
      addToProdTable(ruleData, ruleIndex);
    }
    else {
      const id_elems = IDHandler.deconstructID(ruleID);
      await PersistanceHandler.updateRule(
        id_elems.collectionID,
        id_elems.index,
        ruleData
      );
    }
  }
}

function resetSite() {
  ProdRulesView.clearForm();
  ProdRulesView.clearEntries();
  prepareProdRuleTable();
}

function addToProdTable(prodRule: ProdRule, ruleIndex: number) {
  const ruleID = IDHandler.getRowID(prodRule.source, ruleIndex)
  const actionButtons = ProdRulesView.addEntry(prodRule, ruleID);
  const editButton = actionButtons["edit"] as HTMLButtonElement
  const deleteButton = actionButtons["delete"] as HTMLButtonElement
  editButton.addEventListener("click", function (e) {
    e.preventDefault()
    prepareToEdit(prodRule, ruleIndex);
  });

  deleteButton.addEventListener(
    "click",
    function (e) {
      deleteEntry(prodRule.source, ruleIndex);
    },
    false
  );
}

function prepareToEdit(prodRule: ProdRule, ruleIndex: number) {
  const ruleID = IDHandler.getRowID(prodRule.source, ruleIndex)
  ProdRulesView.setFormValues(prodRule, ruleID);
  ProdRulesView.isFormEditMode(true)
}

function deleteEntry(unproductiveSite: string, ruleIndex: number) {
  const ruleID = IDHandler.getRowID(unproductiveSite, ruleIndex);
  PersistanceHandler.deleteRule(unproductiveSite, ruleIndex);
  ProdRulesView.removeEntry(ruleID);
}


const ProdRulesController = {
  deleteEntry: deleteEntry,
  prepareToEdit: prepareToEdit,
  addToProdTable: addToProdTable,
  addRuleFromForm: addRuleFromForm,
  getStringsForEnums: getStringsForEnums
}

export default ProdRulesController