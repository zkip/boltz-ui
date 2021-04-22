import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import zResolve from "@zrlps/rollup-plugin-resolve";
import pkg from "./package.json";

export default {
	input: "src/index.js",
	output: {
		file: pkg.main,
		format: "umd",
		name: "boltz-ui",
	},
	plugins: [
		svelte(),
		zResolve({
			candidateExt: ["svelte"],
			base: "src",
		}),
		resolve(),
		commonjs(),
	],
};
