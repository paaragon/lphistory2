import inquirer from 'inquirer';

const customValidation = (valid: Function) => {
    return (ans: string) => {
        if (!ans) {
            return true;
        }

        return valid(ans);
    }
};
export default async function question(q: string, choices?: string[] | null, def?: string, validate?: Function): Promise<string> {
    if (def && !choices) {
        q += ` (${def})`.grey;
    }

    const prompt: any = {
        type: choices ? 'list' : 'input',
        message: q,
        name: 'question'
    };

    if (choices) {
        prompt.choices = choices;
        if (def) {
            prompt.default = def;
        }
    }

    if (validate) {
        prompt.validate = customValidation(validate);
    }

    const answer = await inquirer.prompt([prompt]);
    const ansStr = answer.question.toString();

    if ((ansStr === undefined || ansStr === null || ansStr === '') && def) {
        return def;
    }

    return ansStr;
}
