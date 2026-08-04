export function buildResponse(state){

    return{

        answer:state.answer,

        requestId:state.requestId,

        plan:state.plan,

        toolResult:state.toolResult,

        metadata:{

            startedAt:
            state.metadata.startedAt,

            completedAt:
            Date.now()

        }

    };

}