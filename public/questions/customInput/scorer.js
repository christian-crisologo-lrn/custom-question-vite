(function() {
  "use strict";
  class Scorer {
    constructor(question, responseValue) {
      var _a;
      this.question = question;
      this.responseValue = responseValue;
      this.validResponse = ((_a = question == null ? void 0 : question.validation) == null ? void 0 : _a.valid_response) ?? (question == null ? void 0 : question.valid_response);
      console.log("this.validResponse", this.validResponse);
    }
    isValid() {
      var _a;
      const responseValue = this.responseValue ?? null;
      const validResponse = ((_a = this.validResponse) == null ? void 0 : _a.value) ?? null;

      console.log("responseValue:", responseValue, "validResponse:", validResponse);

      if (responseValue === null || validResponse === null) {
        return false;
      }
      return responseValue === validResponse;
    }
    score() {
      console.log("isValid:", this.isValid(), "responseValue:", this.responseValue, "validResponse:", this.validResponse);
      return this.isValid() ? this.maxScore() : 0;
    }
    maxScore() {
      return this.validResponse && this.validResponse.score || 0;
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
