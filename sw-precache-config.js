module.exports = {
  navigateFallback: '/index.html',
  stripPrefix: 'public',
  replacePrefix:'angular-worldwind',
  handleFetch: true,
  skipWaiting: true,
  root: 'public/',
  staticFileGlobs: [
    'public/index.html',
    'public/**.png',
    'public/**.js',
    'public/**.css',
    'public/**.ico',
    'public/**.gif',
    'public/**.svg',
    'public/**.ttf',
    'public/**.eot',
    'public/**.woff',
    'public/**.woff2',
    'public/assets/**.png',
    'public/images/**.png',
    'public/images/**.jpg',
    'public/images/**.svg',
    'public/images/**.jpeg',
    'public/images/pushpins/**.png',
    'public/images/pushpins/**.jpg',
    'public/images/pushpins/**.jpeg', 
    'public/images/pushpins/**.svg', 
    'public/images/view/**.png',
    'public/images/view/**.jpg',
    'public/images/view/**.jpeg', 
    'public/images/view/**.svg'
  ]
};