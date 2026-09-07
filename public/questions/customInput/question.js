(function() {
  "use strict";
  const LRN_CQ_PREFIX = "lrn-custom-input";
  class Question {
    constructor(init, lrnUtils) {
      this.init = init;
      this.events = init.events;
      this.lrnUtils = lrnUtils;
      this.el = init.$el.get(0);
      this.componentStates = {};
      this.validationState = "";
      this.suggestedAnswersList = null;
      this.render().then(() => {
        this.registerPublicMethods();
        this.registerEventsListener();
        if (init.state === "review") {
          init.getFacade().disable();
        }
        this.events.trigger("ready");
      });
    }
    getCorrectAnswer() {
      var _a, _b;
      const questionValidation = (_a = this.init.question) == null ? void 0 : _a.validation;
      const validResponse = (questionValidation == null ? void 0 : questionValidation.valid_response) ?? ((_b = this.init.question) == null ? void 0 : _b.valid_response);
      return (validResponse == null ? void 0 : validResponse.value) ?? "";
    }
    getCurrentValue() {
      const value = this.init.response;
      return value === null || value === void 0 ? "" : String(value);
    }
    getValidationState(value) {
      const correctAnswer = this.getCorrectAnswer();
      if (!correctAnswer) {
        return "";
      }
      return value === correctAnswer ? "correct" : "incorrect";
    }
    getValidationMark(validationState) {
      if (validationState === "correct") {
        return `
        <span class="${LRN_CQ_PREFIX}-status ${LRN_CQ_PREFIX}-status--correct" aria-live="polite">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12.5L9.5 17L19 7.5" />
          </svg>
        </span>
      `;
      }
      if (validationState === "incorrect") {
        return `
        <span class="${LRN_CQ_PREFIX}-status ${LRN_CQ_PREFIX}-status--incorrect" aria-live="polite">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 7L17 17M17 7L7 17" />
          </svg>
        </span>
      `;
      }
      return "";
    }
    render() {
      var _a;
      const { el, lrnUtils } = this;
      el.innerHTML = `
      <div class="${LRN_CQ_PREFIX} lrn-response-validation-wrapper">
        <div class="${LRN_CQ_PREFIX}-root"></div>
        <div class="${LRN_CQ_PREFIX}-checkAnswer-wrapper"></div>
        <div class="${LRN_CQ_PREFIX}-suggestedAnswers-wrapper"></div>
      </div>
    `;
      const checkAnswerWrapper = el.querySelector(`.${LRN_CQ_PREFIX}-checkAnswer-wrapper`);
      const suggestedAnswersWrapper = el.querySelector(`.${LRN_CQ_PREFIX}-suggestedAnswers-wrapper`);
      Boolean((_a = this.init.question) == null ? void 0 : _a.instant_feedback) && this.init.state !== "review";
      return Promise.all([
        lrnUtils.renderComponent("CheckAnswerButton", checkAnswerWrapper),
        lrnUtils.renderComponent("SuggestedAnswersList", suggestedAnswersWrapper)
      ]).then(([_, suggestedAnswersList]) => {
        this.suggestedAnswersList = suggestedAnswersList || null;
        this.renderComponent();
      });
    }
    renderComponent(options = {}) {
      const container = this.el.querySelector(`.${LRN_CQ_PREFIX}-root`);
      const isReviewState = this.init.state === "review";
      const validationState = options.validationUIState ?? this.validationState ?? "";
      const value = options.inputValue !== void 0 ? options.inputValue : this.getCurrentValue();
      const mark = this.getValidationMark(validationState);
      const validationClass = validationState ? ` ${LRN_CQ_PREFIX}--${validationState}` : "";
      const resetButton = `
      <button type="button" class="${LRN_CQ_PREFIX}-reset" data-action="reset-answer">
        Reset
      </button>
    `;
      container.innerHTML = `
      <div class="${LRN_CQ_PREFIX}-field${validationClass}">
          <div class="${LRN_CQ_PREFIX}-input-wrap">
            <input
              class="${LRN_CQ_PREFIX}-input"
              type="text"
              value="${value}"
              ${options.disabled ? "disabled" : ""}
            />
            ${mark || ""}
            ${isReviewState ? "" : resetButton}
          </div>
      </div>
    `;
      if (!isReviewState) {
        const input = container.querySelector("input");
        const resetButtonElement = container.querySelector("button[data-action='reset-answer']");
        if (input) {
          input.addEventListener("change", (event) => {
            this.onValueChange(event.target.value);
          });
        }
        if (resetButtonElement) {
          resetButtonElement.addEventListener("click", () => {
            this.resetAnswer();
          });
        }
      }
    }
    onValueChange(value) {
      const responseValue = value ?? "";
      this.init.response = responseValue;
      if (this.componentStates.resetState) {
        this.renderComponent({ resetState: "attemptedAfterReset" });
      }
      this.renderComponent({
        inputValue: responseValue
      });
      this.events.trigger("changed", responseValue);
    }
    resetAnswer() {
      this.init.response = "";
      this.validationState = "";
      this.events.trigger("resetResponse");
      this.renderComponent({
        validationUIState: "",
        inputValue: ""
      });
    }
    resetValidationUIState() {
      this.validationState = "";
      this.renderComponent({
        validationUIState: "",
        inputValue: this.getCurrentValue()
      });
    }
    registerPublicMethods() {
      const facade = this.init.getFacade();
      facade.disable = () => {
        this.renderComponent({ disabled: true, inputValue: this.getCurrentValue() });
      };
      facade.enable = () => {
        this.renderComponent({ disabled: false, inputValue: this.getCurrentValue() });
      };
      facade.resetResponse = () => {
        this.init.response = "";
        this.validationState = "";
        this.events.trigger("resetResponse");
        this.renderComponent({ resetState: "reset", inputValue: "" });
      };
      facade.getResponse = () => this.getCurrentValue();
    }
    registerEventsListener() {
      this.onValidateListener();
    }
    onValidateListener() {
      const facade = this.init.getFacade();
      const events = this.init.events;
      events.on("validate", (options = {}) => {
        const currentValue = this.getCurrentValue();
        const isValid = facade.isValid();
        this.validationState = isValid ? "correct" : "incorrect";
        this.renderComponent({
          validationUIState: this.validationState,
          inputValue: currentValue
        });
        if (this.suggestedAnswersList) {
          this.suggestedAnswersList.reset();
          if (!isValid && options.showCorrectAnswers) {
            const correctAnswer = this.getCorrectAnswer();
            if (correctAnswer) {
              this.suggestedAnswersList.setAnswers(correctAnswer);
            }
          }
        }
      });
    }
  }
  LearnosityAmd.define([], () => ({
    Question
  }));
})();
