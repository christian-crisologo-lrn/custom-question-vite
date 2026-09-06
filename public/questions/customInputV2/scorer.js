(function() {
  "use strict";
  function TestQuestionScorerV2(question, responseValue) {
    var _a;
    this.question = question;
    this.responseValue = responseValue;
    this.validResponse = (_a = this.question) == null ? void 0 : _a.valid_response;
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
        return this.validResponse && this.validResponse.score ? this.validResponse.score : 0;
      },
      canValidateResponse() {
        var _a2;
        return !!((_a2 = this.validResponse) == null ? void 0 : _a2.value);
      }
    });
  }
  LearnosityAmd.define([], () => ({
    Scorer: TestQuestionScorerV2
  }));
})();
