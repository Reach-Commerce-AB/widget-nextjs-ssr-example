declare global {
	interface Window {
		__loyativeWidgetLoadPromise?: Promise<void>;
		xProduct?: (...args: string[]) => void;
	}
}

export {};
