(function() {
  "use strict";
  function normalizeArray(value) {
    if (Array.isArray(value)) {
      return value.filter((item) => item !== null && item !== void 0 && item !== "").map((item) => String(item));
    }
    if (value === null || value === void 0 || value === "") {
      return [];
    }
    return [String(value)];
  }
  function MultipleOptionScorer(question, responseValue) {
    var _a, _b;
    this.question = question;
    this.responseValue = responseValue;
    this.validResponse = (_b = (_a = this.question) == null ? void 0 : _a.validation) == null ? void 0 : _b.valid_response;
  }
  MultipleOptionScorer.prototype = {
    getCorrectValues() {
      var _a;
      return normalizeArray((_a = this.validResponse) == null ? void 0 : _a.value);
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
      var _a;
      if (typeof ((_a = this.validResponse) == null ? void 0 : _a.score) === "number") {
        return this.validResponse.score;
      }
      return 1;
    },
    canValidateResponse() {
      return this.getCorrectValues().length > 0;
    }
  };
  MultipleOptionScorer.prototype.constructor = MultipleOptionScorer;
  LearnosityAmd.define([], () => ({
    Scorer: MultipleOptionScorer
  }));
})();
