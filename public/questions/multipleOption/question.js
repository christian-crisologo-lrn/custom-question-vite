(function() {
  "use strict";
  const LRN_MCQ_PREFIX = "lrn-multiple-option";
  function normalizeArray(value) {
    if (Array.isArray(value)) {
      return value.filter((item) => item !== null && item !== void 0).map((item) => String(item));
    }
    if (value === null || value === void 0 || value === "") {
      return [];
    }
    return [String(value)];
  }
  function getQuestionOptions(question) {
    if (Array.isArray(question == null ? void 0 : question.options) && question.options.length > 0) {
      return question.options.map((option, index) => {
        if (typeof option === "string") {
          const id = String.fromCharCode(65 + index);
          return { id, label: option };
        }
        return {
          id: String((option == null ? void 0 : option.id) || String.fromCharCode(65 + index)),
          label: String((option == null ? void 0 : option.label) || (option == null ? void 0 : option.value) || `Option ${index + 1}`)
        };
      });
    }
    return [
      { id: "A", label: "Option A" },
      { id: "B", label: "Option B" },
      { id: "C", label: "Option C" },
      { id: "D", label: "Option D" }
    ];
  }
  function MultipleOptionQuestion(init, lrnUtils) {
    var _a;
    this.init = init;
    this.events = init.events;
    this.lrnUtils = lrnUtils;
    this.el = init.$el.get(0);
    this.options = getQuestionOptions(init.question);
    this.isMultiple = ((_a = init.question) == null ? void 0 : _a.multiple_response) !== false;
    this.response = normalizeArray(init.response);
    this.render();
    this.registerPublicMethods();
    this.registerEventsListener();
    if (init.state === "review") {
      init.getFacade().disable();
    }
    this.events.trigger("ready");
  }
  MultipleOptionQuestion.prototype = {
    render() {
      var _a;
      const inputType = this.isMultiple ? "checkbox" : "radio";
      const groupName = `${LRN_MCQ_PREFIX}-${((_a = this.init.question) == null ? void 0 : _a.reference) || "group"}`;
      const choices = this.options.map(({ id, label }) => {
        const checked = this.response.includes(id) ? "checked" : "";
        return `
          <label class="${LRN_MCQ_PREFIX}-choice">
            <input
              type="${inputType}"
              name="${groupName}"
              value="${id}"
              ${checked}
              ${this.init.state === "review" ? "disabled" : ""}
            />
            <span class="${LRN_MCQ_PREFIX}-label">${label}</span>
          </label>
        `;
      }).join("");
      this.el.innerHTML = `
      <div class="${LRN_MCQ_PREFIX}">
        <div class="${LRN_MCQ_PREFIX}-choices">${choices}</div>
      </div>
    `;
    },
    onSelectionChange() {
      if (this.init.state === "review") {
        return;
      }
      const selected = Array.from(this.el.querySelectorAll("input:checked")).map((input) => input.value);
      this.response = selected;
      this.events.trigger("changed", this.isMultiple ? selected : selected[0] || "");
    },
    setDisabledState(disabled) {
      Array.from(this.el.querySelectorAll("input")).forEach((input) => {
        input.disabled = disabled;
      });
    },
    registerPublicMethods() {
      const facade = this.init.getFacade();
      facade.disable = () => {
        this.setDisabledState(true);
      };
      facade.enable = () => {
        this.setDisabledState(false);
      };
      facade.resetResponse = () => {
        this.response = [];
        Array.from(this.el.querySelectorAll("input")).forEach((input) => {
          input.checked = false;
        });
        this.events.trigger("changed", this.isMultiple ? [] : "");
      };
      facade.getResponse = () => {
        return this.isMultiple ? this.response : this.response[0] || "";
      };
    },
    registerEventsListener() {
      this.el.addEventListener("change", (event) => {
        if (event.target && event.target.tagName === "INPUT") {
          this.onSelectionChange();
        }
      });
    }
  };
  MultipleOptionQuestion.prototype.constructor = MultipleOptionQuestion;
  LearnosityAmd.define([], () => ({
    Question: MultipleOptionQuestion
  }));
})();
