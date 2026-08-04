export async function createPlan(state) {

    const message =
        state.message.toLowerCase();

    const plan = {

        intent: "question",

        workflow: "answer",

        tools: []

    };

    if (
        /calculate|add|subtract|multiply|divide|[\d+\-*/()]/i.test(message)
    ) {

        plan.intent = "calculation";

        plan.workflow = "calculate";

        plan.tools.push("calculator");

        return plan;
    }

    if (
        message.includes("github") ||
        message.includes("repository") ||
        message.includes("repo")
    ) {

        plan.intent = "github";

        plan.workflow = "github_lookup";

        plan.tools.push("github");

        return plan;
    }

    plan.tools.push("rag");

    return plan;

}