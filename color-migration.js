/*
  This script will update the styles.scss files for each app to use the new color variables.
  The files generated are based upon _styles.scss in the root of the project.
  This script will take the colors from the defaultConfig.json and instanceConfig.json files in each app's config directory.
  The colors in the instanceConfig.json file will override the colors in the defaultConfig.json file.
  It is entirely possible that this approach will be replaced in the future by other Angular updates.
  */
const fs = require('fs/promises');
const tinycolor = require('tinycolor2');

/**
 * Crawl apps directory and load themes by merging default and instance config
 * @returns {Promise<*[]>} Array of themes for each app
 */
const getThemes = async (local) => {
  // Open apps directory
  let dir = null;
  try {
    dir = await fs.opendir('./apps');
  } catch (error) {
    console.log('Error opening apps directory');
    return;
  }

  const themes = [];
  // Read directory
  let dirent = null;
  while ((dirent = await dir.read()) !== null) {
    // Skip .gitkeep and e2e
    if (dirent.name === '.gitkeep') continue;
    if (dirent.name.includes('e2e')) continue;

    const theme = {
      pathToUpdatedStyles: `./apps/${dirent.name}/src/styles.scss`,
      pathToStyles: `./apps/${dirent.name}/src/_styles.scss`,
      colors: {},
    };
    try {
      // Load default config and set default theme
      const dc_file = await fs.readFile(
        `./apps/${dirent.name}/src/assets/config/defaultConfig.json`,
        'utf-8'
      );
      const dc = JSON.parse(dc_file);
      theme.colors = dc['theme'];

      // Load instance config and override theme
      let pathToIC = `/var/www/perun-web-apps/${dirent.name}/assets/config/instanceConfig.json`;
      if (local) {
        pathToIC = `./apps/${dirent.name}/src/assets/config/instanceConfig.json`
      }
      const ic_file = await fs.readFile(
        pathToIC,
        'utf-8'
      );
      const ic = JSON.parse(ic_file);
      // Override colors
      for (let color in ic['theme']) {
        theme.colors[color] = ic['theme'][color];
      }
    } catch (error) {
      // console.log("Error reading a config file", error);
    } finally {
      for (let color in theme.colors) {
        // Update keys to represent css variable names (e.g. --vo-color)
        let newColor = '--' + color.replaceAll('_', '-');
        theme.colors[newColor] = theme.colors[color];
        delete theme.colors[color];
      }
      themes.push(theme);
    }
  }
  void dir.close();
  return themes;
};

const generatePalette = (color) => {
  // FIXME this simple way of palette creation is not very robust
  // for lighter colors it goes to white on the lower end (for dark to black on higher end)
  const colors = {
    '50': tinycolor(color).lighten(52).toHexString(),
    '100': tinycolor(color).lighten(37).toHexString(),
    '200': tinycolor(color).lighten(26).toHexString(),
    '300': tinycolor(color).lighten(12).toHexString(),
    '400': tinycolor(color).lighten(6).toHexString(),
    '500': tinycolor(color).toHexString(),
    '600': tinycolor(color).darken(6).toHexString(),
    '700': tinycolor(color).darken(12).toHexString(),
    '800': tinycolor(color).darken(18).toHexString(),
    '900': tinycolor(color).darken(24).toHexString(),
    'A100': tinycolor(color).lighten(50).saturate(30).toHexString(),
    'A200': tinycolor(color).lighten(30).saturate(30).toHexString(),
    'A400': tinycolor(color).lighten(10).saturate(15).toHexString(),
    'A700': tinycolor(color).lighten(5).saturate(5).toHexString(),
  };
  for (let hue in colors) {
    colors[`contrast-${hue}`] = tinycolor.mostReadable(colors[hue], ['#ffffff', '#000000']).toHexString();
  }
  return colors;
};

const getEntity = (colorVar) => {
  const entities = ['vo', 'facility', 'resource', 'group', 'member', 'admin', 'user', 'service'];
  for (let entity of entities) {
    if (colorVar.includes(entity)) {
      return entity;
    }
  }
  return null;
}

/**
 * Replaces all variable colors defined in theme with real hex values.
 * Creates new file 'styles.scss' with colors replaced.
 *
 * @param themes Array of themes for each application
 * @returns {Promise<void>}
 */
const updateStyles = async (themes) => {
  for (let theme of themes) {
    let styles = await fs.readFile(theme.pathToStyles, 'utf-8');

    for (let color in theme.colors) {
      // Replace all variable colors
      styles = styles.replaceAll(`var(${color})`, theme.colors[color]);
      // Create palette for entity theme
      const entity = getEntity(color);
      if (entity) {
        const palette = generatePalette(theme.colors[color])
        for (let hue in palette) {
          styles = styles.replaceAll(`var(--${entity}-theme-primary-${hue})`, palette[hue]);
        }
      }
    }
    await fs.writeFile(theme.pathToUpdatedStyles, styles);
  }
};

// Async closure
(async () => {
  let local = false;
  if (process.argv.length > 2) {
    local = Boolean(process.argv[2]);
  }
  const themes = await getThemes(local);
  await updateStyles(themes);
  console.log('Style files are loaded from themes!');
})();
