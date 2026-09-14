import type { ProvisionStep } from "./data"

// Stand-in for a Power Automate flow. Swap runProvisioning for the real
// invocation; the input and the run receipt are the contract.
export const FLOW_NAME = "Provision-New-Starter"

export type StepOutcome = {
  id: string
  state: "done" | "failed"
  message: string
}

export type ProvisionResult = {
  runId: string
  durationMs: number
  outcomes: StepOutcome[]
}

let counter = 2450

function nextRunId() {
  counter += 1
  return `RUN-${counter}`
}

/**
 * Replays a set of provisioning steps, reporting each one as it lands.
 * Resolves with a receipt the caller can persist against the hire.
 */
export function runProvisioning(
  steps: ProvisionStep[],
  onStep: (outcome: StepOutcome) => void,
  resolveMessage: (step: ProvisionStep) => string
): Promise<ProvisionResult> {
  const perStep = 900
  const outcomes: StepOutcome[] = []

  return new Promise((resolve) => {
    steps.forEach((step, index) => {
      window.setTimeout(
        () => {
          const outcome: StepOutcome = {
            id: step.id,
            state: "done",
            message: resolveMessage(step),
          }
          outcomes.push(outcome)
          onStep(outcome)
        },
        perStep * (index + 1)
      )
    })

    window.setTimeout(
      () =>
        resolve({
          runId: nextRunId(),
          durationMs: perStep * steps.length,
          outcomes,
        }),
      perStep * steps.length + 250
    )
  })
}
