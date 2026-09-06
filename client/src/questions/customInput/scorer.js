class Scorer {
  constructor(question, responseValue) {
    this.question = question;
    this.responseValue = responseValue;
    // Support both nested (validation.valid_response) and top-level (valid_response) shapes.
    this.validResponse =
        question?.validation?.valid_response ??
        question?.valid_response;
    console.log('this.validResponse', this.validResponse);
  }

  isValid() {
    const responseValue = this.responseValue ?? null;
    const validResponse = this.validResponse?.value ?? null;

    if (responseValue === null || validResponse === null) {
      return false;
    }

    return responseValue === validResponse;
  }

  score() {
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
