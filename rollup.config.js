import svelte from "rollup-plugin-svelte";
import typescript from "@rollup/plugin-typescript";
import sveltePreprocess from "svelte-preprocess";
import resolve from "@rollup/plugin-node-resolve";
import zResolve from "@zrlps/rollup-plugin-resolve";
import commonjs from "@rollup/plugin-commonjs";
import pkg from "./package.json";

export default {
	input: "src/index.ts",
	output: {
		file: pkg.main,
		format: "umd",
		name: "boltz-ui",
	},
	plugins: [
		svelte({
			preprocess: sveltePreprocess()
		}),
		typescript({ sourceMap: true }),
		zResolve({
			candidateExt: ["svelte"],
			base: "src",
		}),
		resolve(),
		commonjs(),
	],
};
