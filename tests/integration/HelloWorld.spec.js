import HelloWorld from "@/components/HelloWorld/HelloWorld.svelte";
import { render } from "@testing-library/svelte";
import "@testing-library/jest-dom";

test("True", async () => {
	const { getAllByText } = render(HelloWorld);

	expect(getAllByText("Hello").length).toBeGreaterThan(1);
});

test("False", async () => {
	const { getByText, getAllByText } = render(HelloWorld, { is_show: false });

	expect(getByText("World")).toBeInTheDocument();
});
