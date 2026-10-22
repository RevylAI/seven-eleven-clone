const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

// Build artifacts and device evidence are not application modules. Keeping them
// outside Metro's file map avoids unnecessary scanning during native rebuilds.
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const excluded = [
  'ios/build',
  'ios/Pods',
  'android/.gradle',
  'android/app/build',
  '.revyl',
  'artifacts',
  'docs',
];
const config = {
  maxWorkers: 2,
  resolver: {
    blockList: excluded.map(
      dir => new RegExp(`^${escape(path.join(__dirname, dir))}[/\\\\].*`),
    ),
  },
};
module.exports = mergeConfig(getDefaultConfig(__dirname), config);
