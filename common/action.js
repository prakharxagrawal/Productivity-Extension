class ProdEntry {
  constructor(
    badWebsite,
    action = Action((type = ActionType.FRAME), (targetValue = "red")),
    frequency = ActionFrequency.MINUTE,
    condition = ActionCondition.ALWAYS
  ) {
    this.source = badWebsite;
    this.action = action;
    this.target = target;
    this.frequency = frequency;
    this.condition = condition;
  }

  enhanceProductivity() {
    window.addEventListener("load", function () {
      setTimeout(function () {
        this.action.performAction();
      }, this.frequency.duration);
    });
  }

  stringify() {
    return `${this.condition} when I visit ${this.source} then `;
  }
}

class Action {
  constructor(type = ActionType.FRAME, targetValue = "") {
    this.type = type;
    this.targetValue = targetValue;
  }

  performAction() {
    switch (type) {
      case ActionType.FRAME:
        document.body.style.border = `5px solid ${targetValue}`;
        break;
      case ActionType.REDIRECT:
        alert(`This site is unproductive! Redirecting to ${targetValue}.`);
        window.location.href = value;
        break;
      case ActionType.POPUP:
        alert("Do you truly want to spend more time on this site?");
        break;
      case ActionType.LOG:
        console.log(
          "not logging any productivity data at the moment. This feature is WIP."
        );
        break;
      default:
        console.log(
          "Unknown or invalid action type. Will not perform any productivity enahancing action."
        );
    }
  }

  stringify() {
    return `${this.type} ${this.targetValue}`;
  }
}

const ActionType = {
  POPUP: "show a popup",
  REDIRECT: "redirect to",
  FRAME: "frame this site",
  LOG: "simply log this visit (WIP)",
};

const ActionFrequency = {
  IMMEDIATE: { name: "immediately", duration: 0 },
  SECONDS: { name: "after 5 seconds", duration: 5000 },
  MINUTE: { name: "after one minute", duration: 6000 },
  HALFHOUR: { name: "every 30 minutes", duration: 180000 },
  HOUR: { name: "every hour", duration: 360000 },
};

const ActionCondition = {
  ALWAYS: "Always",
  WORK: "While working",
  GOAL: "While my daily goal is not reached",
};

export { Action, ActionCondition, ActionFrequency, ActionType, ProdEntry };