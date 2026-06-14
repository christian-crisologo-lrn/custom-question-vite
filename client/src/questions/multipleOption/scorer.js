function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== null && item !== undefined && item !== '')
      .map((item) => String(item));
  }

  if (value === null || value === undefined || value === '') {
    return [];
  }

  return [String(value)];
}

function MultipleOptionScorer(question, responseValue) {
  this.question = question;
  this.responseValue = responseValue;
  this.validResponse = this.question?.validation?.valid_response;
}

MultipleOptionScorer.prototype = {
  getCorrectValues() {
    return normalizeArray(this.validResponse?.value);
  },

  getResponseValues() {
    return normalizeArray(this.responseValue);
  },

  isValid() {
    const selected = this.getResponseValues();
    const correct = this.getCorrectValues();

    if (selected.length === 0 || correct.length === 0) {
      return false;
    }

    if (selected.length !== correct.length) {
      return false;
    }

    const selectedSet = new Set(selected);
    return correct.every((value) => selectedSet.has(value));
  },

  validateIndividualResponses() {
    return this.isValid();
  },

  score() {
    return this.isValid() ? this.maxScore() : 0;
  },

  maxScore() {
    if (typeof this.validResponse?.score === 'number') {
      return this.validResponse.score;
    }

    return 1;
  },

  canValidateResponse() {
    return this.getCorrectValues().length > 0;
  },
};

MultipleOptionScorer.prototype.constructor = MultipleOptionScorer;

LearnosityAmd.define([], () => ({
  Scorer: MultipleOptionScorer,
}));
