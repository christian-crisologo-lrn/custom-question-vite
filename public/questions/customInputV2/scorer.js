(function() {
  "use strict";
  class Scorer {
    constructor(question, responseValue) {
      var _a;
      this.question = question;
      this.responseValue = responseValue;
      this.validResponse = (_a = this.question) == null ? void 0 : _a.valid_response;
    }
    isValid() {
      var _a;
      const responseValue = this.responseValue ?? null;
      const validResponse = ((_a = this.validResponse) == null ? void 0 : _a.value) ?? null;
      if (responseValue === null || validResponse === null) {
        return false;
      }
      return responseValue === validResponse;
    }
    validateIndividualResponses() {
      return this.isValid();
    }
    score() {
      return this.isValid() ? this.maxScore() : 0;
    }
    maxScore() {
      return this.validResponse && this.validResponse.score ? this.validResponse.score : 0;
    }
    canValidateResponse() {
      var _a;
      return !!((_a = this.validResponse) == null ? void 0 : _a.value);
    }
  }
  LearnosityAmd.define([], () => ({
    Scorer
  }));
})();
