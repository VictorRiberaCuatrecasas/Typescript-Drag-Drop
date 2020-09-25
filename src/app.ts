// Project type
enum ProjectStatus {Active, Finished}

class Project {
    constructor
    (public id: string,
     public title: string,  
     public description: string,  
     public people: number,  
     public status: ProjectStatus ) {

    }
}

//State Management
type Listener = (items: Project[]) => void;

class ProjectState{
    private listeners: any[] = [];
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {}

    static getInstance() {
        if (this.instance){
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    addListener(listenerFn: Listener){
        this.listeners.push(listenerFn);
    }

    addProject(title: string, description: string, numOfPeople: number){
        const newProject = new Project(
            Math.random().toString(), 
            title, description, 
            numOfPeople, 
            ProjectStatus.Active
            );
        this.projects.push(newProject);
        for (const listenerFn of this.listeners){
            listenerFn(this.projects.slice());
        }
    }
}

const projectState = ProjectState.getInstance();

//Validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validatable){
    let isValid = true;
    if (validatableInput.required){
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (validatableInput.minLength != null && typeof validatableInput.value === "string"){
        isValid = isValid && validatableInput.value.length > validatableInput.minLength;
    }
    if (validatableInput.maxLength != null && typeof validatableInput.value === "string"){
        isValid = isValid && validatableInput.value.length < validatableInput.maxLength;
    }
    if (validatableInput.min != null && typeof validatableInput.value === "number"){
        isValid = isValid && validatableInput.value > validatableInput.min;
    }
    if (validatableInput.max != null && typeof validatableInput.value === "number"){
        isValid = isValid && validatableInput.value < validatableInput.max;
    }
    return isValid
}

//autobind decorator 
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

//project list class
class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignedProjects: Project[]

    constructor(private type:"active" | "finished" ){
        this.templateElement = document.getElementById("project-list")! as HTMLTemplateElement;
        this.hostElement = document.getElementById("app")! as HTMLDivElement;
        this.assignedProjects = [];

        const importedTemplate: DocumentFragment = document.importNode(this.templateElement.content, true);
        this.element = importedTemplate.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`; //css styling

        projectState.addListener((projects: Project[]) => {
            this.assignedProjects = projects;
            this.renderProjects();
        })

        this.attach();
        this.renderContent()
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        for (const prjItem of this.assignedProjects) {
            const listItem = document.createElement("li");
            listItem.textContent = prjItem.title
            listEl.appendChild(listItem)
        }
    }

    private renderContent(){
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul")!.id = listId; // ! simbol tells typescript it will at least find one ul, without it, it doesnt know for sure and gives error
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS";
    }

    private attach(){
        this.hostElement.insertAdjacentElement("beforeend", this.element); 
    }
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
        this.element.id = "user-input" //css styling

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

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true
        }
        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }
        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 10
        }

        if (
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable) 
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
            projectState.addProject(title, description, people);
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

//instanciating classes
const setup = new ProjectInput() ;
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");