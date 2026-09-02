/**
 * Wrap every Markdown table in a focusable, horizontally scrollable region.
 *
 * A wide table inside `.doc` would otherwise push the whole page sideways. The
 * wrapper is the element that scrolls, so the `<table>` keeps its table display
 * and its semantics stay intact for screen readers.
 *
 * `tabindex="0"` is required by WCAG 2.1 SC 2.1.1: a region that scrolls must be
 * reachable and scrollable with the keyboard alone. A focusable region needs an
 * accessible name, hence `role="region"` plus the Polish `aria-label`.
 *
 * No dependencies — this walks the hast tree by hand.
 */
export default function rehypeTableScroll() {
  return function transformer(tree) {
    visit(tree);
  };

  function visit(node) {
    const children = node.children;
    if (!Array.isArray(children)) return;

    for (let i = 0; i < children.length; i += 1) {
      const child = children[i];
      if (!child || child.type !== "element") continue;

      if (child.tagName === "table") {
        // Already wrapped by hand-written HTML — leave it alone.
        const isWrapped =
          node.type === "element" &&
          node.tagName === "div" &&
          toClassList(node.properties).includes("table-scroll");
        if (!isWrapped) {
          children[i] = {
            type: "element",
            tagName: "div",
            properties: {
              className: ["table-scroll"],
              tabIndex: 0,
              role: "region",
              "aria-label": "Tabela, przewiń w poziomie",
            },
            children: [child],
          };
        }
        // Nested tables are vanishingly rare, but keep walking anyway.
        visit(child);
        continue;
      }

      visit(child);
    }
  }
}

function toClassList(properties) {
  const className = properties?.className;
  if (Array.isArray(className)) return className;
  if (typeof className === "string") return className.split(/\s+/);
  return [];
}
