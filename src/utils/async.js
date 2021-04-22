export const tasks = (...args) => Promise.all(args);

export const sleep = (ms) => new Promise((rv) => setTimeout(rv, ms));
