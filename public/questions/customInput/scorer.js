(function() {
  "use strict";
  function TestQuestionScorer(question, responseValue) {
    var _a, _b;
    this.question = question;
    this.responseValue = responseValue;
    this.validResponse = (_b = (_a = this.question) == null ? void 0 : _a.validation) == null ? void 0 : _b.valid_response;
  }
  TestQuestionScorer.prototype = {
    isValid() {
      var _a;
      const responseValue = this.responseValue ?? null;
      const validResponse = ((_a = this.validResponse) == null ? void 0 : _a.value) ?? null;
      if (responseValue === null || validResponse === null) {
        return false;
      }
      return responseValue === validResponse;
    },
    validateIndividualResponses() {
      return this.isValid();
    },
    score() {
      return this.isValid() ? this.maxScore() : 0;
    },
    maxScore() {
      return this.validResponse && this.validResponse.score || 0;
    },
    canValidateResponse() {
      var _a;
      return !!((_a = this.validResponse) == null ? void 0 : _a.value);
    }
  };
  TestQuestionScorer.prototype.constructor = TestQuestionScorer;
  LearnosityAmd.define([], () => ({
    Scorer: TestQuestionScorer
  }));
})();
