export const invokeLLM = async (params: any) => {
    return {
        choices: [{ message: { content: JSON.stringify({ entries: [] }) } }]
    };
};
