const colors = require("tailwindcss/colors");

const makeCheckedCheckbox = (color) => {
	return `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 3L4.5 8.5L2 6' stroke='${encodeURIComponent(
		color
	)}' stroke-width='1.6666' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E%0A")`;
};

const makeIndeterminateCheckbox = (color) => {
	return `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.5 6H9.5' stroke='${encodeURIComponent(
		color
	)}' stroke-width='1.66666' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E%0A")`;
};

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			backgroundImage: {
				"checkbox-checked": makeCheckedCheckbox(colors.purple[500]),
				"checkbox-indeterminate": makeIndeterminateCheckbox(colors.purple[500]),
				"checkbox-checked-disabled": makeCheckedCheckbox(colors.gray[200]),
				"checkbox-indeterminate-disabled": makeIndeterminateCheckbox(
					colors.gray[200]
				),
			},
		},
	},
	plugins: [],
};
