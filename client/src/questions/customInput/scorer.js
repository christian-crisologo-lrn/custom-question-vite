function Scorer(question, responseValue) {
  this.question = question;
  this.responseValue = responseValue;
  this.validResponse = this.question?.validation?.valid_response;

  Object.assign(this, {
    isValid() {
      const responseValue = this.responseValue ?? null;
      const validResponse = this.validResponse?.value ?? null;

      if (responseValue === null || validResponse === null) {
        return false;
      }

      console.log('responseValue:', responseValue, 'validResponse:', validResponse);

      return responseValue === validResponse;
    },

    validateIndividualResponses() {
      return this.isValid();
    },

    score() {
      console.log('Scoring response. Is valid:', this.isValid());
      const score = this.isValid() ? this.maxScore() : 0;
      console.log('Calculated score:', score);
      return score;
    },

    maxScore() {
      return (this.validResponse && this.validResponse.score) || 0;
    },

    canValidateResponse() {
      return !!this.validResponse?.value;
    },
  });
}

LearnosityAmd.define([], () => ({
  Scorer,
}));
