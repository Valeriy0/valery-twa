import { makeAutoObservable } from "mobx";

class Links {

	constructor() {
		makeAutoObservable(this);
	}
	
	
	GoMain = () => {
		document.getElementById("Partners")?.classList.add('hidden');
		document.getElementById("About")?.classList.add('hidden');
		document.getElementById("Main")?.classList.remove('hidden');
	}

	GoAbout = () => {
		document.getElementById("Partners")?.classList.add('hidden');
		document.getElementById("Main")?.classList.add('hidden');
		document.getElementById("About")?.classList.remove('hidden');
	}

	GoPartners = () => {
		document.getElementById("About")?.classList.add('hidden');
		document.getElementById("Main")?.classList.add('hidden');
		document.getElementById("Partners")?.classList.remove('hidden');
	}

}

export default new Links();