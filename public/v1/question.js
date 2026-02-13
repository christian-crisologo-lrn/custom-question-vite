const LRN_CQ_PREFIX1 = "lrn-test-question-v1";

class QuestionV1 {
  constructor(init, lrnUtils) {
    this.init = init;
    this.events = init.events;
    this.lrnUtils = lrnUtils;
    this.el = init.$el.get(0);
    this.componentStates = {};

    this.render().then(() => {
      this.registerPublicMethods();
      this.registerEventsListener();

      if (init.state === "review") {
        init.getFacade().disable();
      }

      init.events.trigger("ready");
    });
  }

  render() {
    this.el.innerHTML = `
      <div class="${LRN_CQ_PREFIX1} lrn-response-validation-wrapper">
        <div class="${LRN_CQ_PREFIX1}-root"></div>
      </div>
    `;

    return Promise.all([]).then(() => {
      this.renderComponent();
    });
  }

  renderComponent(options = {}) {
    const container = this.el.querySelector(`.${LRN_CQ_PREFIX1}-root`);
    let validResponseValue = "";
    if (this.init.question?.valid_response) {
      validResponseValue = this.init.question.valid_response.value;
    }
    
    container.innerHTML = `
      <div class="lrn-custom-question">
        <div class="lrn_response_input lrn-response-validation-wrapper">
          ${
            this.init.state === "review"
              ? `
            <div>
              <div>given answer: ${this.init.response}</div>
              <div>correct answer: ${validResponseValue}</div>
            </div>
          `
              : `<input type="text">`
          }
        </div>
      </div>
    `;

    if (this.init.state !== "review") {
      container.querySelector("input").addEventListener("change", (event) => {
        this.onValueChange(event.target.value);
      });
    }
  }

  onValueChange = (value) => {
    if (this.componentStates.resetState) {
      this.renderComponent({ resetState: "attemptedAfterReset" });
    }

    this.events.trigger("changed", value);
  };

  resetValidationUIState = () => {
    this.renderComponent({
      validationUIState: "",
    });
  };

  registerPublicMethods() {
    const facade = this.init.getFacade();

    facade.disable = () => {
      this.renderComponent({ disabled: true });
    };
    facade.enable = () => {
      this.renderComponent({ disabled: false });
    };

    facade.resetResponse = () => {
      this.events.trigger("resetResponse");

      this.renderComponent({ resetState: "reset" });
    };

    facade.showValidationUI = () => {
        const inputContainer = this.el.querySelector(".lrn_response_input");
        if (facade.isValid()) {
            inputContainer.classList.add("lrn_correct");
        } else {
            inputContainer.classList.add("lrn_incorrect");
        }
    };
    
    facade.resetValidationUI = () => {
        const inputContainer = this.el.querySelector(".lrn_response_input");
        inputContainer.classList.remove("lrn_correct", "lrn_incorrect");
        this.suggestedAnswersList.reset();
    };
  }

  registerEventsListener() {
    this.onValidateListener();
  }

  onValidateListener() {
    const facade = this.init.getFacade();
    const events = this.init.events;

    events.on("validate", () => {
      const isValid = facade.isValid();
      facade.showValidationUI();

      this.renderComponent({
        validationUIState: isValid ? "correct" : "incorrect",
      });
    });
  }
}

LearnosityAmd.define([], () => ({
  Question: QuestionV1
}));
