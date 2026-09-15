const STORAGE_KEY = 'app-config';

type ColorScheme = 'light' | 'dark';

interface PersistedConfig {
	colorScheme: ColorScheme;
}

function loadPersistedConfig(): PersistedConfig {
	const defaults: PersistedConfig = { colorScheme: 'light' };

	if (typeof localStorage === 'undefined') return defaults;

	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return defaults;
		return { ...defaults, ...JSON.parse(raw) };
	} catch {
		return defaults;
	}
}

class Config {
	colorScheme = $state<ColorScheme>(loadPersistedConfig().colorScheme);

	constructor() {
		$effect.root(() => {
			$effect(() => {
				if (typeof document !== 'undefined') {
					document.documentElement.classList.toggle('dark', this.colorScheme === 'dark');
				}

				if (typeof localStorage !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify({ colorScheme: this.colorScheme }));
				}
			});
		});
	}

	toggleColorScheme() {
		this.colorScheme = this.colorScheme === 'light' ? 'dark' : 'light';
	}
}

export const config = new Config();
