const mapRouting = (conf) => {
  if (!conf.routing) {
    return {
      add: false,
      npm: [],
    };
  }
  return {
    add: true,
    npm: [],
  };
};

module.exports = {
  mapRouting,
};
