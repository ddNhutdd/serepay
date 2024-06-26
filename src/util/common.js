import { adminPermision } from "src/constant";
import { callToastSuccess } from "src/function/toast/callToast";
import { availableLanguageCodeMapper } from "src/translation/i18n";
import * as XLSX from "xlsx/xlsx.mjs";

export const setLocalStorage = (key, data) => {
	try {
		localStorage.setItem(key, JSON.stringify(data));
	} catch (e) {
	}
};
export const getLocalStorage = (key) => {
	try {
		return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(""));
	} catch (e) {
		return null;
	}
};
export const removeLocalStorage = (key) => {
	try {
		localStorage.removeItem(key);
	} catch (e) {
	}
};
/**
 * Hàm nhận vào một chuỗi số với định dạng theo kiểu US (dấu chấm phân tách phần thập phân)
 * Hàm định dạng lại chuỗi số bằng cách thêm dấu phẩy vào phần thập phân phía trước dấu chấm
 * Nếu truyền một chuỗi không đúng định dạng thì hàm lặp tức dừng thực thi và return undefine
 * @numberString {string} stringValue chuỗi số.
 * @returns {string} - chuỗi số sau khi đã thêm dấu phẩy.
 */
export const formatStringNumberCultureUS = (numberString) => {
	const regex = /^$|^[0-9]+(\.[0-9]*)?$/;
	if (!regex.test(numberString)) return;
	const parts = numberString.split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
};
export const convertStringToNumber = function (str) {
	if (!str) return NaN;
	var noCommas = str.replace(/,/g, "");
	var number = Number(noCommas);
	if (isNaN(number)) {
		return 0;
	} else {
		return number;
	}
};
/**
 * Chia một chuỗi thành hai phần bằng ký tự trắng cuối cùng.
 *
 * @param {string} string - Chuỗi cần chia.
 * @return {Array} Một mảng chứa hai phần của chuỗi. Nếu chuỗi không chứa ký tự trắng,
 *   chuỗi gốc sẽ được trả về là phần tử duy nhất của mảng.
 */
export const splitStringByWhitespaceFromEnd = function (string) {
	let index = -1;
	for (let i = string.length - 1; i >= 0; i--) {
		if (string[i] === " ") {
			index = i;
			break;
		}
	}
	if (index === -1) {
		return [string];
	}
	return [string.slice(0, index), string.slice(index + 1)];
};
/**
 * Chia một chuỗi thành phần số và phần chuỗi.
 *
 * @param {string} inputString - Chuỗi đầu vào để chia.
 * @return {object|null} Một object chứa phần số và phần chuỗi,
 * hoặc null nếu chuỗi đầu vào không khớp với mẫu mong đợi.
 */
export const splitStringAndNumber = function (inputString) {
	var match = inputString.match(/([0-9.]+)([a-zA-Z]+)/);
	if (match) {
		return {
			numberPart: parseFloat(match[1]), stringPart: match[2],
		};
	} else {
		return null;
	}
};
export const roundDecimalValues = function (value, coinValue) {
	let decimalPlaces;
	if (coinValue > 10000) {
		decimalPlaces = 8;
	} else if (coinValue >= 100 && coinValue <= 9999) {
		decimalPlaces = 6;
	} else {
		decimalPlaces = 2;
	}
	const roundedValue = +value.toFixed(decimalPlaces);
	return roundedValue;
};
export const roundDownDecimalValues = function (value, coinValue) {
	let decimalPlaces;
	if (coinValue > 10000) {
		decimalPlaces = 8;
	} else if (coinValue >= 100 && coinValue <= 9999) {
		decimalPlaces = 6;
	} else {
		decimalPlaces = 2;
	}

	// Làm tròn xuống bằng cách thêm một số rất nhỏ vào trước khi làm tròn
	const roundedValue = +(Math.floor(value * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)).toFixed(decimalPlaces);
	return roundedValue;
};
export const zoomImage = function (e) {
	const body = document.body;
	let angel = 0, size = 1.2;
	let zoomValue = 0.2;
	let rotateValue = 18;
	let isDragging = false;
	let initialX, initialY;
	//img
	var imgElement = document.createElement("img");
	imgElement.src = e.target.src;
	imgElement.style.transition = "transform 0.4s ease-in-out";
	imgElement.style.width = "300px";
	imgElement.style.objectFit = "cover";
	imgElement.style.position = "fixed";
	imgElement.style.top = "50%";
	imgElement.style.left = "50%";
	imgElement.style.transform = `translate(-50%, -50%) scale(0.1) rotate(${angel}deg)`;
	imgElement.style.zIndex = 10000;
	document.body.appendChild(imgElement);
	setTimeout(function () {
		imgElement.style.transform = `translate(-50%, -50%) scale(${size}) rotate(${angel}deg)`;
	}, 100);
	imgElement.addEventListener("wheel", (ev) => {
		ev.preventDefault();
		wheelHandle(ev);
	});
	imgElement.addEventListener("mousedown", (event) => {
		isDragging = true;
		initialX = event.pageX - imgElement.offsetLeft;
		initialY = event.pageY - imgElement.offsetTop;
	});
	document.addEventListener("mousemove", (event) => {
		if (isDragging) {
			event.preventDefault();
			const x = event.pageX - initialX;
			const y = event.pageY - initialY;
			imgElement.style.left = x + "px";
			imgElement.style.top = y + "px";
		}
	});
	document.addEventListener("mouseup", () => {
		isDragging = false;
	});
	imgElement.addEventListener("mouseover", function () {
		this.style.cursor = "pointer";
	});
	imgElement.addEventListener("mouseout", function () {
		this.style.cursor = "auto";
	});
	// control
	const sizeUp = function () {
		size += zoomValue;
		imgElement.style.transform = `translate(-50%, -50%) scale(${size}) rotate(${angel}deg)`;
	};
	const sizeDown = function () {
		size -= zoomValue;
		if (size <= 0) size = 0;
		imgElement.style.transform = `translate(-50%, -50%) scale(${size}) rotate(${angel}deg)`;
	};
	const rotateRight = function () {
		angel += rotateValue;
		imgElement.style.transform = `translate(-50%, -50%) scale(${size}) rotate(${angel}deg)`;
	};
	const rotateLeft = function () {
		angel -= rotateValue;
		imgElement.style.transform = `translate(-50%, -50%) scale(${size}) rotate(${angel}deg)`;
	};
	const wheelHandle = function (ev) {
		if (ev.deltaY < 0) {
			sizeUp();
		} else if (ev.deltaY > 0) {
			sizeDown();
		}
	};
	const gl_header = document.createElement("div");
	gl_header.style.position = "fixed";
	gl_header.style.top = 0;
	gl_header.style.left = 0;
	gl_header.style.right = 0;
	gl_header.style.height = 80;
	gl_header.style.zIndex = 10001;
	gl_header.style.display = "flex";
	gl_header.style.justifyContent = "flex-end";
	gl_header.style.alignContent = "center";
	const icons = ["<i class='fa-solid fa-rotate-left'></i>", "<i class='fa-solid fa-rotate-right'></i>", "<i class='fa-solid fa-magnifying-glass-plus'></i>", "<i class='fa-solid fa-magnifying-glass-minus'></i>", "<i class='fa-solid fa-xmark'></i>",];
	for (let icon of icons) {
		const gl_span = document.createElement("div");
		gl_span.innerHTML = icon;
		gl_span.style.fontSize = "26px";
		gl_span.style.color = "#fff";
		gl_span.style.fontWeight = "bold";
		gl_span.style.marginTop = "10px";
		gl_span.style.marginLeft = "10px";
		gl_span.style.marginRight = "10px";
		gl_span.style.cursor = "pointer";
		gl_span.style.userSelect = "none";
		if (icon === icons[2]) {
			gl_span.addEventListener("click", sizeUp);
		} else if (icon === icons[3]) {
			gl_span.addEventListener("click", sizeDown);
		} else if (icon === icons[1]) {
			gl_span.addEventListener("click", rotateRight);
		} else if (icon === icons[0]) {
			gl_span.addEventListener("click", rotateLeft);
		} else if (icon === icons[4]) {
			gl_span.addEventListener("click", () => {
				setTimeout(function () {
					imgElement.style.transition = "transform 0.2s ease-in-out";
					imgElement.style.transform = `translate(-50%, -50%) scale(0.1) rotate(${angel}deg)`;
				}, 100);
				setTimeout(function () {
					gl_overlay.remove();
					imgElement.remove();
					gl_header.remove();
				}, 301);
			});
		}
		gl_header.appendChild(gl_span);
	}
	body.appendChild(gl_header);
	//overlay
	const gl_overlay = document.createElement("div");
	gl_overlay.style.position = "fixed";
	gl_overlay.style.top = 0;
	gl_overlay.style.bottom = 0;
	gl_overlay.style.left = 0;
	gl_overlay.style.right = 0;
	gl_overlay.style.zIndex = 9999;
	gl_overlay.style.backgroundColor = "#000000b3";
	gl_overlay.addEventListener("wheel", (ev) => {
		ev.preventDefault();
		wheelHandle(ev);
	});
	gl_overlay.addEventListener("click", (e) => {
		setTimeout(function () {
			imgElement.style.transition = "transform 0.2s ease-in-out";
			imgElement.style.transform = `translate(-50%, -50%) scale(0.1) rotate(${angel}deg)`;
		}, 100);
		setTimeout(function () {
			e.target.remove();
			imgElement.remove();
			gl_header.remove();
		}, 301);
	});
	body.appendChild(gl_overlay);
};
export const generateNewURL = function (baseUrl, username, coin, amountCoin, note) {
	// Kiểm tra xem baseUrl có chứa dấu "?" hay không
	const separator = baseUrl.includes("?") ? "&" : "?";
	// Tạo URL mới bằng cách kết hợp baseUrl với các tham số
	const newURL = `${baseUrl}${separator}username=${username}&coin=${coin}&amountCoin=${amountCoin}&note=${encodeURIComponent(note)}`;
	return newURL;
};
export const parseURLParameters = function (url) {
	const queryString = url.split("?")[1];
	if (!queryString) {
		return {};
	}
	const queryParams = queryString.split("&");
	const result = {};
	queryParams.forEach((param) => {
		const [key, value] = param.split("=");
		result[key] = decodeURIComponent(value);
	});
	return result;
};
export const getClassListFromElementById = function (id) {
	const element = document.getElementById(id);
	if (element) return element.classList;
};
export const getElementById = function (id) {
	return document.getElementById(id);
};
export const querySelector = function (cssSelector) {
	return document.querySelector(cssSelector);
};
export const addClassToElementById = function (id, classname) {
	let element = document.getElementById(id);
	if (!element) return;
	if (!element.classList.contains(classname)) {
		element.classList.add(classname);
	}
};
export const hideElement = function (element) {
	if (!element) return;
	!element.classList.contains("--d-none") && element.classList.add("--d-none");
};
export const showElement = function (element) {
	if (!element) return;
	element.classList.remove("--d-none");
};
export const debounce = function (func, ms) {
	let timeout;
	return function (...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(this, args), ms);
	};
};
/**
 * The write function capitalizes the beginning of each word
 * @param {string} str
 * @returns The new string has been formatted
 */
export const capitalizeFirstLetter = function (str) {
	return str.replace(/(^\w{1}|\s+\w{1})/g, (letter) => letter.toUpperCase());
};
export const calculateTime = function (inputString, addMinutes, subtractSeconds) {
	const inputDate = new Date(inputString);
	inputDate.setMinutes(inputDate.getMinutes() + addMinutes);
	inputDate.setSeconds(inputDate.getSeconds() - subtractSeconds);
	const resultString = inputDate.toISOString();
	return resultString;
};
/**
 * splits the datetime string into components
 * @param {string} dateTimeString format 2023-12-22T14:20:32.000Z
 * @returns obj {year, month, day, hour, minute, second}
 */
export const extractDateTimeComponents = function (dateTimeString) {
	const dateTime = new Date(dateTimeString);
	const year = dateTime.getUTCFullYear();
	const month = dateTime.getUTCMonth() + 1;
	const day = dateTime.getUTCDate();
	const hour = dateTime.getUTCHours();
	const minute = dateTime.getUTCMinutes();
	const second = dateTime.getUTCSeconds();
	return {
		year, month, day, hour, minute, second,
	};
};
export const calculateTimeDifference = function (dateTimeString1, dateTimeString2) {
	const result = {
		mm: 0, ss: 0,
	};
	if (!dateTimeString1 || !dateTimeString2) return result;
	const date1 = new Date(dateTimeString1);
	const date2 = new Date(dateTimeString2);
	const timeDifference = date2 - date1;
	if (timeDifference <= 0) return result;
	const newDate = new Date(timeDifference);
	result.mm = newDate.getMinutes();
	result.ss = newDate.getSeconds();
	return result;
};
export const formatTime = function (seconds) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;
	const formattedTime = `${hours}:${String(minutes).padStart(2, "0")}:${Math.floor(remainingSeconds).toString().padStart(2, "0")}`;
	return formattedTime;
};
/**
 * The function receives a string and a list of subStrings. For each subString found in the string, it runs the callback function
 * @param {string} inputString
 * @param {Array} substringsList
 * @param {string} callback
 * @returns jsx
 */
export const processString = function (inputString, substringsList, callback) {
	let resultJSX = [];
	let currentStartIndex = 0;
	for (const substring of substringsList) {
		const index = inputString.indexOf(substring, currentStartIndex);
		if (index !== -1) {
			const substringBefore = inputString.substring(currentStartIndex, index);
			resultJSX.push(substringBefore);
			resultJSX.push(callback(substring, resultJSX.length));
			currentStartIndex = index + substring.length;
		}
	}
	if (currentStartIndex < inputString.length) {
		resultJSX.push(inputString.substring(currentStartIndex));
	}
	return <>{resultJSX}</>;
};
/**
 * The function randomly selects an element in the array, returns that element, if the array is empty, returns null
 * @param {array} arr list items
 * @returns new item
 */
export const getRandomElementFromArray = function (arr) {
	if (!arr || arr.length <= 0) return null;
	const randomIndex = Math.floor(Math.random() * arr.length);
	return arr[randomIndex];
};
export const roundIntl = function (maximum) {
	return {
		style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: maximum,
	};
};
export const rountRange = function (price) {
	if (price > 10000) return 8; else if (price > 100 && price <= 9999) return 6; else if (price <= 99) return 2;
};
export const formatCurrency = function (locale, currency, number, showSymbol = true) {
	if (showSymbol) {
		return new Intl.NumberFormat(availableLanguageCodeMapper[locale], {
			style: "currency", currency,
		}).format(number);
	} else {
		return new Intl.NumberFormat(availableLanguageCodeMapper[locale], {
			style: "currency", currency, currencyDisplay: "code",
		})
			.format(number)
			.replace(currency, "")
			.trim();
	}
};
export const formatNumber = function (number, locale, digits) {
	if (digits === -1) {
		return new Intl.NumberFormat(availableLanguageCodeMapper[locale], roundIntl(8)).format(number);
	} else {
		return new Intl.NumberFormat(availableLanguageCodeMapper[locale], roundIntl(digits)).format(number);
	}
};
export const findMin = function (...params) {
	return Math.min(...params);
};
export const observeWidth = function (setWidth) {
	return new ResizeObserver((entries) => {
		for (let entry of entries) {
			const { width, height } = entry.contentRect;
			setWidth(width);
		}
	});
};
export const createIntersectionObserve = function (htmlElement, animationClass) {
	const options = {
		root: null, rootMargin: "0px", threshold: 0.2,
	};
	const callback = function (entries) {
		for (const entry of entries) {
			const element = entry.target;
			if (!entry.isIntersecting) return; else !element.classList.contains(animationClass) && element.classList.add(animationClass);
		}
	};

	const observer = new IntersectionObserver(callback, options);
	const element = document.getElementById(htmlElement);
	observer.observe(element);
	return observer;
};
export const addAnimation = function (listId, listAnimation) {
	const listObserse = [];
	for (let i = 0; i < listId.length; i++) {
		const temp = createIntersectionObserve(listId.at(i), listAnimation.at(i));
		listObserse.push(temp);
	}
	return listObserse;
};
export const exportExcel = function (data, nameSheet, nameFile) {
	return new Promise((resolve, reject) => {
		let wb = XLSX.utils.book_new();
		let ws = XLSX.utils.json_to_sheet(data);
		XLSX.utils.book_append_sheet(wb, ws, nameSheet);
		XLSX.writeFile(wb, `${nameFile}.xlsx`);
		resolve(true);
	});
};
export const convertJsonStringToArray = (jsonString) => {
	try {
		const jsonData = JSON.parse(jsonString);
		if (!Array.isArray(jsonData)) {
			throw new Error("Dữ liệu JSON không phải là mảng");
		}
		return jsonData;
	} catch (error) {
		return [];
	}
};
export const checkIsMainAccount = (profile) => {
	if (profile?.parentUserIdWallet === profile?.id) return true;
	return false;
}
export const messageTransferHandle = (res, t) => {
	const subStringList = ['##1##', '@U#S#DT##', '$#$#na$#ne'];
	const process = (matched, index) => {
		let content;
		switch (matched) {
			case subStringList.at(0):
				content = res.amount;
				break;
			case subStringList.at(1):
				content = res.symbol;
				break;
			case subStringList.at(2):
				content = res.username;
				break
			default:
				break;
		}
		return <span key={index} style={{ fontWeight: 600, color: 'green' }}>{content}</span>
	}
	const mess = processString(t('ouGet1UsdtTFromUserNamePercy'), subStringList, process)
	callToastSuccess(mess);
};
export const checkKeyInObj = (key, obj) => {
	if (key in obj) {
		return true;
	} else {
		return false;
	}
}
export const shortenHash = (inputString) => {
	if (typeof inputString !== 'string') {
		return;
	}
	const length = inputString.length;
	if (length < 14) {
		return inputString;
	}
	const firstPart = inputString.substring(0, 8);
	const lastPart = inputString.substring(length - 6);
	const formattedString = firstPart.toUpperCase() + '...' + lastPart.toLowerCase();
	return formattedString;
}

export const formatInputNumber = (inputValue) => {
	const inputValueString = inputValue.toString();
	const inputValueWithoutComma = inputValueString.replace(/,/g, "");
	const regex = /^$|^[0-9]+(\.[0-9]*)?$/;
	if (!regex.test(inputValueWithoutComma)) {
		return inputValueString.slice(0, inputValueString.length - 1);
	}
	return formatStringNumberCultureUS(inputValueWithoutComma);
};

export const deepCopyArray = (arr) => {
	let copy = [];

	for (let i = 0; i < arr.length; i++) {
		if (Array.isArray(arr[i])) {
			// Nếu phần tử là một mảng, thực hiện deep copy bằng đệ quy
			copy[i] = deepCopyArray(arr[i]);
		} else if (typeof arr[i] === 'object' && arr[i] !== null) {
			// Nếu phần tử là một đối tượng, thực hiện deep copy bằng cách sao chép từng thuộc tính
			copy[i] = deepCopyObject(arr[i]);
		} else {
			// Nếu phần tử không phải mảng hoặc đối tượng, chỉ cần sao chép giá trị
			copy[i] = arr[i];
		}
	}

	return copy;
}

export const deepCopyObject = (obj) => {
	let copy = {};

	for (let key in obj) {
		if (Array.isArray(obj[key])) {
			// Nếu giá trị của thuộc tính là một mảng, thực hiện deep copy bằng đệ quy
			copy[key] = deepCopyArray(obj[key]);
		} else if (typeof obj[key] === 'object' && obj[key] !== null) {
			// Nếu giá trị của thuộc tính là một đối tượng, thực hiện deep copy bằng cách sao chép từng thuộc tính
			copy[key] = deepCopyObject(obj[key]);
		} else {
			// Nếu giá trị của thuộc tính không phải mảng hoặc đối tượng, chỉ cần sao chép giá trị
			copy[key] = obj[key];
		}
	}

	return copy;
}

export const analysisAdminPermision = (functionName, permissionObject) => {
	if (!functionName || !permissionObject) {
		return adminPermision.noPermision;
	}
	const edit = permissionObject?.['edit' + capitalizeFirstLetter(functionName)];
	const justWatch = permissionObject?.[functionName];
	if (justWatch === 0) {
		return adminPermision.noPermision;
	}

	if (edit === 1) {
		return adminPermision.edit;
	}


	return adminPermision.watch;
}
