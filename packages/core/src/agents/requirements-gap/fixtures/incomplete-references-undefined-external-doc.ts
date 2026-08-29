import type { RequirementsGapFixture } from "./types.js";
import { statusIs } from "../assertions.js";

const text = `Feature: Payment Retry Logic

If a payment fails, the system retries according to the retry policy defined in the payment processing design document. The user is notified only after all retries are exhausted.`;

export const incompleteReferencesUndefinedExternalDoc: RequirementsGapFixture = {
  name: "incomplete-references-undefined-external-doc",
  input: { text },
  assertions: [
    statusIs("complete"),
    (result) => {
      const mentionsDesignDoc = result.output?.missing_information.some((g) =>
        g.text.toLowerCase().includes("design document")
      );
      return {
        pass: !!mentionsDesignDoc,
        message: `expected a missing_information item noting the retry policy is referenced but not defined here, got ${JSON.stringify(
          result.output?.missing_information
        )}`,
      };
    },
  ],
};
