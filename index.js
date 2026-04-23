const board = document.getElementById("board");
const addListButton = document.getElementById("addListButton");
const newListTitleInput = document.getElementById("newListTitle");
const listTemplate = document.getElementById("listTemplate");
const cardTemplate = document.getElementById("cardTemplate");

let draggedCard = null;

const createId = (prefix) => {
	const randomPart = Math.random().toString(36).slice(2, 9);
	return `${prefix}-${Date.now()}-${randomPart}`;
};

const normalizeEditableText = (element, fallbackText) => {
	const cleaned = element.textContent.trim().replace(/\s+/g, " ");
	element.textContent = cleaned || fallbackText;
};

const attachEditableTitleBehavior = (element, fallbackText) => {
	element.addEventListener("blur", () => normalizeEditableText(element, fallbackText));
	element.addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			element.blur();
		}
	});
};

const createCardElement = (title) => {
	const cardFragment = cardTemplate.content.cloneNode(true);
	const cardElement = cardFragment.querySelector(".card");
	const cardTitle = cardFragment.querySelector(".card-title");
	const removeButton = cardFragment.querySelector(".remove-card");

	cardElement.dataset.cardId = createId("card");
	cardTitle.textContent = title;

	attachEditableTitleBehavior(cardTitle, "Card sem titulo");

	removeButton.addEventListener("click", () => {
		cardElement.remove();
	});

	cardElement.addEventListener("dragstart", () => {
		draggedCard = cardElement;
		cardElement.classList.add("dragging");
	});

	cardElement.addEventListener("dragend", () => {
		cardElement.classList.remove("dragging");
		draggedCard = null;
		document.querySelectorAll(".cards").forEach((cards) => {
			cards.classList.remove("drop-target");
		});
	});

	return cardElement;
};

const appendCard = (cardsContainer, cardTitleText) => {
	const card = createCardElement(cardTitleText);
	cardsContainer.appendChild(card);
};

const getCardAfterCursor = (cardsContainer, mouseY) => {
	const cards = [...cardsContainer.querySelectorAll(".card:not(.dragging)")];

	return cards.reduce(
		(closest, child) => {
			const box = child.getBoundingClientRect();
			const offset = mouseY - box.top - box.height / 2;

			if (offset < 0 && offset > closest.offset) {
				return { offset, element: child };
			}

			return closest;
		},
		{ offset: Number.NEGATIVE_INFINITY, element: null }
	).element;
};

const setupListDropArea = (cardsContainer) => {
	cardsContainer.addEventListener("dragover", (event) => {
		if (!draggedCard) {
			return;
		}

		event.preventDefault();
		cardsContainer.classList.add("drop-target");

		const nextCard = getCardAfterCursor(cardsContainer, event.clientY);
		if (!nextCard) {
			cardsContainer.appendChild(draggedCard);
			return;
		}

		cardsContainer.insertBefore(draggedCard, nextCard);
	});

	cardsContainer.addEventListener("dragleave", (event) => {
		if (!cardsContainer.contains(event.relatedTarget)) {
			cardsContainer.classList.remove("drop-target");
		}
	});

	cardsContainer.addEventListener("drop", () => {
		cardsContainer.classList.remove("drop-target");
	});
};

const createListElement = (title) => {
	const listFragment = listTemplate.content.cloneNode(true);
	const listElement = listFragment.querySelector(".list");
	const listTitle = listFragment.querySelector(".list-title");
	const removeListButton = listFragment.querySelector(".remove-list");
	const cardsContainer = listFragment.querySelector(".cards");
	const newCardForm = listFragment.querySelector(".new-card-form");
	const newCardInput = listFragment.querySelector(".new-card-input");

	listElement.dataset.listId = createId("list");
	listTitle.textContent = title;

	attachEditableTitleBehavior(listTitle, "Lista sem titulo");
	setupListDropArea(cardsContainer);

	removeListButton.addEventListener("click", () => {
		listElement.remove();
	});

	newCardForm.addEventListener("submit", (event) => {
		event.preventDefault();

		const cardTitleText = newCardInput.value.trim();
		if (!cardTitleText) {
			newCardInput.focus();
			return;
		}

		appendCard(cardsContainer, cardTitleText);
		newCardInput.value = "";
		newCardInput.focus();
	});

	return listElement;
};

const addList = () => {
	const title = newListTitleInput.value.trim();
	if (!title) {
		newListTitleInput.focus();
		return;
	}

	const listElement = createListElement(title);
	board.appendChild(listElement);
	newListTitleInput.value = "";
};

addListButton.addEventListener("click", addList);

newListTitleInput.addEventListener("keydown", (event) => {
	if (event.key === "Enter") {
		addList();
	}
});

const seedInitialData = () => {
	const todoList = createListElement("A Fazer");
	const doingList = createListElement("Fazendo");
	const doneList = createListElement("Concluido");

	appendCard(todoList.querySelector(".cards"), "Criar layout inicial");
	appendCard(todoList.querySelector(".cards"), "Definir regras de drag and drop");
	appendCard(doingList.querySelector(".cards"), "Implementar adicao de cards");
	appendCard(doneList.querySelector(".cards"), "Preparar estrutura base");

	board.append(todoList, doingList, doneList);
};

seedInitialData();
