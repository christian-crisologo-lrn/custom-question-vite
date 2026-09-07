const LRN_CQ_PREFIX = "lrn-custom-input";

class Question {
  constructor(init, lrnUtils) {
    this.init = init;
    this.events = init.events;
    this.lrnUtils = lrnUtils;
    this.el = init.$el.get(0);
    this.componentStates = {};
    this.validationState = "";

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
    const questionValidation = this.init.question?.validation;
    const validResponse = questionValidation?.valid_response;
    return validResponse?.value ?? "";
  }

  getCurrentValue() {
    const value = this.init.response;
    return value === null || value === undefined ? "" : String(value);
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
    this.el.innerHTML = `
      <div class="${LRN_CQ_PREFIX} lrn-response-validation-wrapper">
        <div class="${LRN_CQ_PREFIX}-root"></div>
      </div>
    `;

    return Promise.all([]).then(() => {
      this.renderComponent();
    });
  }

  renderComponent(options = {}) {
    const container = this.el.querySelector(`.${LRN_CQ_PREFIX}-root`);
    const isReviewState = this.init.state === "review";
    const validationState = options.validationUIState ?? this.validationState ?? "";
    const value = options.inputValue !== undefined ? options.inputValue : this.getCurrentValue();
    const mark = this.getValidationMark(validationState);
    const validationClass = validationState ? ` ${LRN_CQ_PREFIX}--${validationState}` : "";
    const resetButton = `
      <button type="button" class="${LRN_CQ_PREFIX}-reset" data-action="reset-answer">
        Reset
      </button>
    `;

    container.innerHTML = `
      <div class="${LRN_CQ_PREFIX}-field${validationClass}">
        ${
          isReviewState
            ? `
          <div>
            <div>given answer: ${this.init.response}</div>
            <div>correct answer: ${this.getCorrectAnswer()}</div>
          </div>
        `
            : `
          <div class="${LRN_CQ_PREFIX}-input-wrap">
            <input
              class="${LRN_CQ_PREFIX}-input"
              type="text"
              value="${value}"
              ${options.disabled ? "disabled" : ""}
            />
            ${mark || ""}
            ${resetButton}
          </div>
        `
        }
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

    const shouldShowInstantFeedback = Boolean(this.init.question?.instant_feedback);
    const validationState = shouldShowInstantFeedback
      ? this.getValidationState(responseValue)
      : "";

    this.validationState = validationState;
    this.renderComponent({
      validationUIState: validationState,
      inputValue: responseValue,
    });

    this.events.trigger("changed", responseValue);
  }

  resetAnswer() {
    this.init.response = "";
    this.validationState = "";
    this.events.trigger("resetResponse");
    this.renderComponent({
      validationUIState: "",
      inputValue: "",
    });
  }

  resetValidationUIState() {
    this.validationState = "";
    this.renderComponent({
      validationUIState: "",
      inputValue: this.getCurrentValue(),
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
    this.onShowCorrectAnswerListener();
  }

  onValidateListener() {
    const facade = this.init.getFacade();
    const events = this.init.events;

    events.on("validate", () => {
      const currentValue = this.getCurrentValue();
      const isValid = facade.isValid();
      this.validationState = isValid ? "correct" : "incorrect";

      this.renderComponent({
        validationUIState: this.validationState,
        inputValue: currentValue,
      });
    });
  }

  onShowCorrectAnswerListener() {
    const events = this.init.events;
    const correctAnswer = this.getCorrectAnswer();

    events.on("show-correct-answer", () => {
      this.validationState = correctAnswer ? "correct" : "incorrect";
      this.renderComponent({
        validationUIState: this.validationState,
        inputValue: correctAnswer,
      });
    });

    events.on("hide-correct-answer", () => {
      this.validationState = this.getValidationState(this.getCurrentValue());
      this.renderComponent({
        validationUIState: this.validationState,
        inputValue: this.getCurrentValue(),
      });
    });
  }
}

LearnosityAmd.define([], () => ({
  Question,
}));
