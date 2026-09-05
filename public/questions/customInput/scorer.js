(function() {
  "use strict";
  function TestQuestionScorer(question, responseValue) {
    var _a, _b;
    this.question = question;
    this.responseValue = responseValue;
    this.validResponse = (_b = (_a = this.question) == null ? void 0 : _a.validation) == null ? void 0 : _b.valid_response;
    Object.assign(this, {
      isValid() {
        var _a2;
        const responseValue2 = this.responseValue ?? null;
        const validResponse = ((_a2 = this.validResponse) == null ? void 0 : _a2.value) ?? null;
        if (responseValue2 === null || validResponse === null) {
          return false;
        }
        return responseValue2 === validResponse;
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
        var _a2;
        return !!((_a2 = this.validResponse) == null ? void 0 : _a2.value);
      }
    });
  }
  LearnosityAmd.define([], () => ({
    Scorer: TestQuestionScorer
  }));
})();
