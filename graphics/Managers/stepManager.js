export default class StepManager {
  constructor() {
    this.currentStep = 0;
    this.lastTriggeredStep = -1; // Track which step was last triggered
    this.steps = [];
  }

  addStepCallback(stepIndex, callback) {
    this.steps[stepIndex] = callback;
  }

  setCurrentStep(step) {
    if (this.currentStep !== step) {
      this.currentStep = step;
      this.triggerStep();
    }
  }

  triggerStep() {
    if (this.lastTriggeredStep !== this.currentStep) {
      this.lastTriggeredStep = this.currentStep;
      if (this.steps[this.currentStep]) {
        this.steps[this.currentStep](); // Execute the step callback
      }
    }
  }

  render() {
    // Optional: If render needs to react based on the step manager
    this.triggerStep();
  }
}
