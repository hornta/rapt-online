import { ReactNode, createContext } from "react";

export const ButtonGroupContext = createContext(null);

interface ButtonGroupProps {
	children?: ReactNode;
}

export const ButtonGroup = ({ children }: ButtonGroupProps) => {
	return (
		<ButtonGroupContext.Provider value={null}>
			{children}
		</ButtonGroupContext.Provider>
	);
};
