const LRN_MCQ_PREFIX = 'lrn-multiple-option';

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== null && item !== undefined).map((item) => String(item));
  }

  if (value === null || value === undefined || value === '') {
    return [];
  }

  return [String(value)];
}

function getQuestionOptions(question) {
  if (Array.isArray(question?.options) && question.options.length > 0) {
    return question.options.map((option, index) => {
      if (typeof option === 'string') {
        const id = String.fromCharCode(65 + index);
        return { id, label: option };
      }

      return {
        id: String(option?.id || String.fromCharCode(65 + index)),
        label: String(option?.label || option?.value || `Option ${index + 1}`),
      };
    });
  }

  return [
    { id: 'A', label: 'Option A' },
    { id: 'B', label: 'Option B' },
    { id: 'C', label: 'Option C' },
    { id: 'D', label: 'Option D' },
  ];
}

function MultipleOptionQuestion(init, lrnUtils) {
  this.init = init;
  this.events = init.events;
  this.lrnUtils = lrnUtils;
  this.el = init.$el.get(0);
  this.options = getQuestionOptions(init.question);
  this.isMultiple = init.question?.multiple_response !== false;
  this.response = normalizeArray(init.response);
  this.componentStates = {};

  this.render().then(() => {
    this.registerPublicMethods();
    this.registerEventsListener();

    if (init.state === 'review') {
      init.getFacade().disable();
    }

    init.events.trigger('ready');
  });
}

MultipleOptionQuestion.prototype = {
  render() {
    this.el.innerHTML = `
      <div class="${LRN_MCQ_PREFIX} lrn-response-validation-wrapper">
        <div class="${LRN_MCQ_PREFIX}-root"></div>
      </div>
    `;

    return Promise.all([]).then(() => {
      this.renderComponent();
    });
  },

  renderComponent(options = {}) {
    const container = this.el.querySelector(`.${LRN_MCQ_PREFIX}-root`);
    const inputType = this.isMultiple ? 'checkbox' : 'radio';
    const groupName = `${LRN_MCQ_PREFIX}-${this.init.question?.reference || 'group'}`;
    const isDisabled = options.disabled || this.init.state === 'review';
    const validationClass = options.validationUIState
      ? ` ${LRN_MCQ_PREFIX}--${options.validationUIState}`
      : '';

    const choices = this.options
      .map(({ id, label }) => {
        const checked = this.response.includes(id) ? 'checked' : '';
        return `
          <label class="${LRN_MCQ_PREFIX}-choice">
            <input
              type="${inputType}"
              name="${groupName}"
              value="${id}"
              ${checked}
              ${isDisabled ? 'disabled' : ''}
            />
            <span class="${LRN_MCQ_PREFIX}-label">${label}</span>
          </label>
        `;
      })
      .join('');

    container.innerHTML = `
      <div class="${LRN_MCQ_PREFIX}-choices${validationClass}">${choices}</div>
    `;

    if (!isDisabled) {
      container.addEventListener('change', (event) => {
        if (event.target && event.target.tagName === 'INPUT') {
          this.onValueChange();
        }
      });
    }
  },

  onValueChange() {
    if (this.componentStates.resetState) {
      this.renderComponent({ resetState: 'attemptedAfterReset' });
    }

    const selected = Array.from(this.el.querySelectorAll('input:checked')).map((input) => input.value);
    this.response = selected;
    this.events.trigger('changed', this.isMultiple ? selected : selected[0] || '');
  },

  resetValidationUIState() {
    this.renderComponent({
      validationUIState: '',
    });
  },

  registerPublicMethods() {
    const facade = this.init.getFacade();

    facade.disable = () => {
      this.renderComponent({ disabled: true });
    };

    facade.enable = () => {
      this.renderComponent({ disabled: false });
    };

    facade.resetResponse = () => {
      this.response = [];
      this.events.trigger('resetResponse');
      this.renderComponent({ resetState: 'reset' });
    };

    facade.getResponse = () => {
      return this.isMultiple ? this.response : this.response[0] || '';
    };
  },

  registerEventsListener() {
    this.onValidateListener();
  },

  onValidateListener() {
    const facade = this.init.getFacade();
    const events = this.init.events;

    events.on('validate', () => {
      const isValid = facade.isValid();

      this.renderComponent({
        validationUIState: isValid ? 'correct' : 'incorrect',
      });
    });
  },
};

MultipleOptionQuestion.prototype.constructor = MultipleOptionQuestion;

LearnosityAmd.define([], () => ({
  Question: MultipleOptionQuestion,
}));
