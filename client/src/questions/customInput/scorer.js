class Scorer {
  constructor(question, responseValue) {
    this.question = question;
    this.responseValue = responseValue;
    this.validResponse = question?.validation?.valid_response;

    console.log('this.validResponse', this.validResponse, 'question:', this.question, 'responseValue:', this.responseValue);
  }

  isValid() {
    const responseValue = this.responseValue ?? null;
    const validResponse = this.validResponse?.value ?? null;

    console.log('responseValue:', responseValue, 'validResponse:', validResponse);

    if (responseValue === null || validResponse === null) {
      return false;
    }

    return responseValue === validResponse;
  }

  score() {
    console.log('isValid:', this.isValid(), 'responseValue:', this.responseValue, 'validResponse:', this.validResponse);
    return this.isValid() ? this.maxScore() : 0;
  }

  maxScore() {
    return (this.validResponse && this.validResponse.score) || 0;
  }

  canValidateResponse() {
    return !!this.validResponse?.value;
  }
}

LearnosityAmd.define([], () => ({
  Scorer,
}));
