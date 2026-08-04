export const calculatorTool={

    name:"calculator",

    async execute(state){

        const expression=
            state.message.replace("calculate","");

        const answer=
            Function(
            `"use strict";return (${expression})`
            )();

        return{

            answer:String(answer)

        };

    }

}