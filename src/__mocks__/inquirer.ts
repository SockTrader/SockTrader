const inquirer: any = jest.genMockFromModule("inquirer");

let promptResponse = false;

inquirer.__setPrompt = (response: boolean) => {
    promptResponse = response;
};

inquirer.prompt = () => ({confirmation: promptResponse});

module.exports = inquirer;
