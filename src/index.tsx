import React from "react";
import ReactDOM from "react-dom";

import App from "./app";

import "./styles/index.scss";

document.body.insertAdjacentHTML("afterbegin", "<div id=\"root\"></div>");

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById("root")
);