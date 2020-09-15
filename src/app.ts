//autobind decorator -> 
function autobind(_: any, _2: string, descriptor: PropertyDescriptor){ // _ as parameter allows u to put parameters that you are not going to use when you need to access other parameter positions
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get(){
            const boundFn = originalMethod.bind(this);
            return boundFn
        }
    }
    return adjDescriptor
}

//project input class
class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;


    constructor(){
        this.templateElement = document.getElementById("project-input")! as HTMLTemplateElement;
        this.hostElement = document.getElementById("app")! as HTMLDivElement;

        const importedTemplate: DocumentFragment = document.importNode(this.templateElement.content, true);
        this.element = importedTemplate.firstElementChild as HTMLFormElement;
        this.element.id="user-input" //css styling

        this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement;

        this.configure()
        this.attach()
    }

    private gatherUserInput(): [string, string, number] | void{
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        if (
            enteredTitle.trim().length === 0 ||
            enteredDescription.trim().length === 0 ||
            enteredPeople.trim().length === 0
        ){
            alert("invalid input, please try again!");
            return;
        }else{
            return[ enteredTitle, enteredDescription, +enteredPeople]
        }
    }

    private clearInput(){
        this.titleInputElement.value = "";
        this. descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }

    @autobind
    private submitHandler(event: Event){
        event.preventDefault();
        const userInput = this.gatherUserInput();

        if (Array.isArray(userInput)){
            const [title, description, people] = userInput;
            console.log(title, description, people)
            this.clearInput()
        }
    }

    private configure(){
        this.element.addEventListener("submit", this.submitHandler) 
    }

    private attach(){
        this.hostElement.insertAdjacentElement("afterbegin", this.element);
    }
}

const setup = new ProjectInput()