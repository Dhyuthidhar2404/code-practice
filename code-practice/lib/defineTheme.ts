// Import monaco only on the client side
const isClient = typeof window !== 'undefined';
let monaco: any;
let loader: any;

if (isClient) {
  import('monaco-editor').then(m => {
    monaco = m;
  });
  import('@monaco-editor/react').then(m => {
    loader = m.loader;
    initializeThemes();
  }).catch(err => {
    console.error("Error loading monaco editor:", err);
  });
}

const monacoThemes = {
  active4d: 'Active4D',
  'all-hallows-eve': 'All Hallows Eve',
  amy: 'Amy',
  'birds-of-paradise': 'Birds of Paradise',
  blackboard: 'Blackboard',
  'brilliance-black': 'Brilliance Black',
  'brilliance-dull': 'Brilliance Dull',
  'chrome-devtools': 'Chrome DevTools',
  'clouds-midnight': 'Clouds Midnight',
  clouds: 'Clouds',
  cobalt: 'Cobalt',
  dawn: 'Dawn',
  dracula: 'Dracula',
  dreamweaver: 'Dreamweaver',
  eiffel: 'Eiffel',
  'espresso-libre': 'Espresso Libre',
  github: 'GitHub',
  idle: 'IDLE',
  katzenmilch: 'Katzenmilch',
  'krtheme': 'krTheme',
  kuroir: 'Kuroir',
  lazy: 'LAZY',
  'magicwb-(amiga)': 'MagicWB (Amiga)',
  'merbivore-soft': 'Merbivore Soft',
  merbivore: 'Merbivore',
  'monokai-bright': 'Monokai Bright',
  monokai: 'Monokai',
  'night-owl': 'Night Owl',
  'oceanic-next': 'Oceanic Next',
  'pastels-on-dark': 'Pastels on Dark',
  'slush-and-poppies': 'Slush and Poppies',
  'solarized-dark': 'Solarized Dark',
  'solarized-light': 'Solarized Light',
  spacecadet: 'SpaceCadet',
  sunburst: 'Sunburst',
  textmate: 'TextMate',
  'tomorrow-night-blue': 'Tomorrow Night Blue',
  'tomorrow-night-bright': 'Tomorrow Night Bright',
  'tomorrow-night-eighties': 'Tomorrow Night Eighties',
  'tomorrow-night': 'Tomorrow Night',
  tomorrow: 'Tomorrow',
  twilight: 'Twilight',
  'upstream-sunburst': 'Upstream Sunburst',
  'vibrant-ink': 'Vibrant Ink',
  xcode: 'Xcode',
  zenburnesque: 'Zenburnesque',
};

// Define a cache to avoid reloading themes
const loadedThemes = new Set<string>();

// Predefine a set of base themes that we know work
const predefinedThemes = [
  'oceanic-next',
  'monokai',
  'github',
  'vs-dark',
  'vs-light'
];

// Function to initialize themes on the client side only
function initializeThemes() {
  if (!isClient || !loader) return;
  
  loader.init().then((monacoInstance: any) => {
    monacoInstance.editor.defineTheme('oceanic-next', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '#65737e', fontStyle: 'italic' },
        { token: 'keyword', foreground: '#c594c5' },
        { token: 'string', foreground: '#99c794' },
        { token: 'number', foreground: '#f99157' },
        { token: 'operator', foreground: '#5fb3b3' },
      ],
      colors: {
        'editor.foreground': '#cdd3de',
        'editor.background': '#1b2b34',
        'editor.selectionBackground': '#4f5b66',
        'editor.lineHighlightBackground': '#65737e55',
        'editorCursor.foreground': '#c594c5',
        'editorWhitespace.foreground': '#65737e',
      },
    });
    
    // Define monokai theme
    monacoInstance.editor.defineTheme('monokai', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '#75715E', fontStyle: 'italic' },
        { token: 'keyword', foreground: '#F92672' },
        { token: 'string', foreground: '#E6DB74' },
        { token: 'number', foreground: '#AE81FF' },
        { token: 'operator', foreground: '#F8F8F2' },
      ],
      colors: {
        'editor.foreground': '#F8F8F2',
        'editor.background': '#272822',
        'editor.selectionBackground': '#49483E',
        'editor.lineHighlightBackground': '#3E3D32',
        'editorCursor.foreground': '#F8F8F0',
        'editorWhitespace.foreground': '#3B3A32',
      },
    });
    
    // Define github theme
    monacoInstance.editor.defineTheme('github', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '#6a737d', fontStyle: 'italic' },
        { token: 'keyword', foreground: '#d73a49' },
        { token: 'string', foreground: '#032f62' },
        { token: 'number', foreground: '#005cc5' },
        { token: 'operator', foreground: '#d73a49' },
      ],
      colors: {
        'editor.foreground': '#24292e',
        'editor.background': '#ffffff',
        'editor.selectionBackground': '#c8c8fa',
        'editor.lineHighlightBackground': '#fafbfc',
        'editorCursor.foreground': '#24292e',
        'editorWhitespace.foreground': '#959da5',
      },
    });
    
    loadedThemes.add('oceanic-next');
    loadedThemes.add('monokai');
    loadedThemes.add('github');
    console.log('Predefined themes loaded');
  });
}

/**
 * Defines a Monaco editor theme
 * @param theme The theme ID to define
 * @returns A promise that resolves when the theme is loaded
 */
export const defineTheme = async (theme: string): Promise<void> => {
  // If we're on the server-side, just resolve immediately
  if (!isClient) {
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    try {
      // Use default themes if they're built-in
      if (['vs-dark', 'vs-light', 'hc-black', 'hc-light'].includes(theme)) {
        console.log(`Using built-in theme: ${theme}`);
        resolve();
        return;
      }
      
      // Skip if theme is already loaded
      if (loadedThemes.has(theme)) {
        console.log(`Theme ${theme} already loaded, using cached version`);
        resolve();
        return;
      }
      
      // Fall back to a predefined theme if the requested theme is not in the predefined list
      if (!predefinedThemes.includes(theme)) {
        console.log(`Theme ${theme} is not available, falling back to oceanic-next`);
        resolve();
        return;
      }
      
      // For predefined themes that we've manually defined, just resolve
      if (predefinedThemes.includes(theme) && theme !== 'vs-dark' && theme !== 'vs-light') {
        console.log(`Using predefined theme: ${theme}`);
        resolve();
        return;
      }
      
      // We should never reach here, but just in case
      console.log(`Falling back to default theme vs-dark`);
      resolve();
    } catch (error) {
      console.error(`Unexpected error loading theme ${theme}:`, error);
      resolve(); // Resolve anyway to prevent blocking
    }
  });
}; 