/*
  This script will update the styles.scss files for each app to use the new color variables.
  The files generated are based upon _styles.scss in the root of the project.
  This script will take the colors from the defaultConfig.json and instanceConfig.json files in each app's config directory.
  The colors in the instanceConfig.json file will override the colors in the defaultConfig.json file.
  It is entirely possible that this approach will be replaced in the future by other Angular updates.
  */
const fs = require('fs/promises');
const tinycolor = require('tinycolor2');

// Crawls apps directory
const getConfigs = async () => {
  // Open apps directory
  let dir = null;
  try {
    dir = await fs.opendir('./apps');
  } catch (error) {
    console.log("Error opening apps directory");
    return;
  }

  const configs = [];
  // Read directory
  let dirent = null;
  while ((dirent = await dir.read()) !== null) {
    // Skip .gitkeep and e2e
    if (dirent.name === '.gitkeep') continue;
    if (dirent.name.includes('e2e')) continue;

    const config = {
      name: dirent.name,
      path: `./apps/${dirent.name}`,
      colors: {}
    }
    try {
      const file = await fs.readFile(`./apps/${dirent.name}/src/assets/config/defaultConfig.json`, 'utf-8');
      const obj = JSON.parse(file);
      config.colors = obj["theme"];
      // Update configs with instanceConfig.json
      const file2 = await fs.readFile(`./apps/${dirent.name}/src/assets/config/instanceConfig.json`, 'utf-8');
      const obj2 = JSON.parse(file2);
      // Update missing colors
      for (let color in obj2["theme"]) {
        // Update colors with colors from instanceConfig
        if (config.colors[color] != null) {
          config.colors[color] = obj2["theme"][color];
        }
      }
    } catch (error) {
      //console.log("Error reading a config file", error);
    } finally {
      for (let color in config.colors) {
        if (color.includes('_')) {
          // Update keys to have - instead of _
          let newColor = color.replaceAll('_', '-');
          // Remove '-color' from each color name
          newColor = newColor.substring(0, newColor.indexOf('-color'));
          config.colors[newColor] = config.colors[color];
          delete config.colors[color];
        }
      }
      configs.push(config);
    }
  }
  dir.close();
  return configs;
}

const generatePallette = (color) => {
  const colors = {
    "50": tinycolor(color).lighten(52).toHexString(), // light
    "100": tinycolor(color).lighten(37).toHexString(), // light
    "200": tinycolor(color).lighten(26).toHexString(),
    "300": tinycolor(color).lighten(12).toHexString(),
    "400": tinycolor(color).lighten(6).toHexString(),
    "500": tinycolor(color).toHexString(),
    "600": tinycolor(color).darken(6).toHexString(),
    "700": tinycolor(color).darken(12).toHexString(),
    "800": tinycolor(color).darken(18).toHexString(),
    "900": tinycolor(color).darken(24).toHexString(),
    "A100": tinycolor(color).lighten(50).saturate(30).toHexString(), // light
    "A200": tinycolor(color).lighten(30).saturate(30).toHexString(),
    "A400": tinycolor(color).lighten(10).saturate(15).toHexString(),
    "A700": tinycolor(color).lighten(5).saturate(5).toHexString(),
  }
  const contrast = {};
  for (let key in colors) {
    if (tinycolor(colors[key]).isLight()) {
      contrast[key] = tinycolor("#1e1e1e").toHexString();
    } else {
      contrast[key] = tinycolor("#ffffff").toHexString();
    }
  }
  return { colors, contrast };
}

const updateTemplates = async (configs) => {
  // Open styles file and replace colors from config
  for (let config of configs) {
    let _style = await fs.readFile(`${config.path}/src/_styles.scss`, 'utf-8');
    for (let color in config.colors) {
      // Special case for entities
      // var(--{entity}-theme-primary-50)
      const regex = new RegExp(`var\\(--${color}-theme-primary-(.*\\d{2,3}\\))`, 'g');
      const matches = _style.match(regex);

      if (matches != null) {
        for (const match of matches) {
          const pallette = generatePallette(config.colors[color]);
          const key = match.substring(match.lastIndexOf('-') + 1, match.indexOf(')'));

          if (match.includes('contrast')) {
            _style = _style.replaceAll(match, pallette.contrast[key]);
            continue;
          }
          _style = _style.replaceAll(match, pallette.colors[key]);
        }
      }
    }
    // Save cahnges to styles.scss
    await fs.writeFile(`${config.path}/src/styles.scss`, _style);
  }
}

// Async closure
(async () => {
  const configs = await getConfigs();
  await updateTemplates(configs);
  console.log("Style files are loaded from themes!")
})();
